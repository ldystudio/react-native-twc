# react-native-twc

> Create reusable React Native + NativeWind components with Tailwind CSS syntax

This project is a **React Native adaptation** of [TWC (react-twc)](https://github.com/gregberge/twc) by [Greg Bergé](https://github.com/gregberge). The original TWC library provides an elegant way to create styled React components with Tailwind CSS. This fork adapts the library specifically for React Native with NativeWind support.

## Features

- ⚡️ **Lightweight** — only ~1KB minified
- ✨ **Full TypeScript support** with autocompletion
- 🎨 **Dynamic styling** based on props
- 🦄 **Works with any React Native component**
- 🚀 **First-class `tailwind-merge` and `cva` support**
- 📱 **Built for React Native + NativeWind**

## Installation

```bash
# npm
npm install react-native-twc

# yarn
yarn add react-native-twc

# bun
bun add react-native-twc
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-native nativewind tailwind-merge
```

## Usage

### Basic Usage

**Without `twc`:**

```tsx
import * as React from "react";
import { View, Text, ViewProps } from "react-native";
import clsx from "clsx";

const Card = React.forwardRef<View, ViewProps>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={clsx("rounded-lg border bg-slate-100 p-4 shadow-sm", className)}
    {...props}
  />
));
```

**With `twc`:**

```tsx
import { View } from "react-native";
import { twc } from "react-native-twc";

const Card = twc(View)`rounded-lg border bg-slate-100 p-4 shadow-sm`;
```

### Creating Styled Components

```tsx
import { View, Text, Pressable, TextInput } from "react-native";
import { twc } from "react-native-twc";

// Basic styled components
const Container = twc(View)`flex-1 bg-white p-4`;
const Title = twc(Text)`text-2xl font-bold text-gray-900`;
const Subtitle = twc(Text)`text-lg text-gray-600`;

// Styled input
const Input = twc(TextInput)`border border-gray-300 rounded-lg px-4 py-2`;

// Styled button
const Button = twc(Pressable)`bg-blue-500 py-3 px-6 rounded-lg`;
const ButtonText = twc(Text)`text-white font-semibold text-center`;
```

### Dynamic Styling with Props

Use the `$` prefix for transient props that won't be passed to the underlying component:

```tsx
import { Pressable, Text } from "react-native";
import { twc, TwcComponentProps } from "react-native-twc";

type ButtonProps = TwcComponentProps<typeof Pressable> & {
  $variant?: "primary" | "secondary" | "danger";
};

const Button = twc(Pressable)<ButtonProps>((props) => [
  "py-3 px-6 rounded-lg font-semibold",
  {
    "bg-blue-500": props.$variant === "primary",
    "bg-gray-200": props.$variant === "secondary",
    "bg-red-500": props.$variant === "danger",
  },
]);

// Usage
<Button $variant="primary">
  <Text className="text-white">Click me</Text>
</Button>
```

### Using with `attrs`

Add default props to your components:

```tsx
import { TextInput } from "react-native";
import { twc } from "react-native-twc";

const EmailInput = twc(TextInput).attrs({
  keyboardType: "email-address",
  autoCapitalize: "none",
  placeholder: "Enter your email",
})`border border-gray-300 rounded-lg px-4 py-2`;

// Usage
<EmailInput onChangeText={(text) => console.log(text)} />
```

### Using with CVA (Class Variance Authority)

```tsx
import { Pressable } from "react-native";
import { cva, VariantProps } from "class-variance-authority";
import { twc, TwcComponentProps } from "react-native-twc";

const buttonVariants = cva("rounded-lg font-semibold", {
  variants: {
    $intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
      danger: "bg-red-500 text-white",
    },
    $size: {
      sm: "py-1 px-2 text-sm",
      md: "py-2 px-4 text-base",
      lg: "py-3 px-6 text-lg",
    },
  },
  defaultVariants: {
    $intent: "primary",
    $size: "md",
  },
});

type ButtonProps = TwcComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

const Button = twc(Pressable)<ButtonProps>(({ $intent, $size }) =>
  buttonVariants({ $intent, $size })
);

// Usage
<Button $intent="danger" $size="lg">
  <Text>Delete</Text>
</Button>
```

### Using with Tailwind Merge

Use the built-in `twx` for automatic class conflict resolution:

```tsx
import { Text } from "react-native";
import { twx } from "react-native-twc";

const Title = twx(Text)`font-bold text-lg`;

// Later classes override earlier ones
<Title className="font-normal text-sm">Hello</Title>
// Result: "font-normal text-sm" (conflicts resolved)
```

Or create your own instance:

```tsx
import { twMerge } from "tailwind-merge";
import { createTwc } from "react-native-twc";

const twc = createTwc({ compose: twMerge });
```

### Custom Transient Props

By default, props starting with `$` are not forwarded. Customize this behavior:

```tsx
import { View } from "react-native";
import { twc, TwcComponentProps } from "react-native-twc";

type Props = TwcComponentProps<typeof View> & { size: "sm" | "lg" };

const Box = twc(View).transientProps(["size"])<Props>((props) => ({
  "w-4 h-4": props.size === "sm",
  "w-8 h-8": props.size === "lg",
}));

// 'size' won't be passed to the underlying View
<Box size="lg" />
```

## API Reference

### `twc(Component)`

Wraps a React Native component and returns a template function.

```tsx
const StyledView = twc(View)`bg-white p-4`;
```

### `createTwc(config)`

Creates a custom TWC instance with configuration options.

```tsx
const twc = createTwc({
  compose: twMerge, // Custom class merging function
  shouldForwardProp: (prop) => !prop.startsWith("_"), // Custom prop filtering
});
```

### `TwcComponentProps<T>`

Utility type to extract props from a TWC-wrapped component.

```tsx
type CardProps = TwcComponentProps<typeof View>;
```

### `cn(...inputs)`

Utility function combining `clsx` and `tailwind-merge`.

```tsx
import { cn } from "react-native-twc";

const className = cn("p-4", condition && "bg-blue-500", ["rounded", "shadow"]);
```

### `twx`

Pre-configured TWC instance using `tailwind-merge` for class conflict resolution.

```tsx
import { twx } from "react-native-twc";

const Title = twx(Text)`font-bold`;
```

## Differences from Original TWC

| Feature | Original TWC | react-native-twc |
|---------|--------------|------------------|
| HTML tags (`twc.div`) | ✅ Supported | ❌ Not supported |
| `asChild` prop | ✅ Supported | ❌ Not supported |
| React Native components | ❌ Not optimized | ✅ Fully supported |
| NativeWind | ❌ Not designed for | ✅ First-class support |

## Acknowledgements

- [TWC (react-twc)](https://github.com/gregberge/twc) by [Greg Bergé](https://github.com/gregberge) - The original inspiration and foundation for this project
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [styled-components](https://styled-components.com) - Where the template literal API originated
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) - Intelligent Tailwind class merging

## License

MIT License © 2023-Present [Greg Bergé](https://github.com/gregberge)

---

**Note:** This is a community fork adapted for React Native. For the original React (web) version, please visit [react-twc](https://github.com/gregberge/twc).
