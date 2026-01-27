import { describe, expect, test, beforeEach } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { twMerge } from "tailwind-merge";
import { twc, createTwc, type TwcComponentProps } from "./index";

/**
 * 模拟 React Native 组件
 * 在测试环境中模拟 RN 组件的基本行为
 */

// 模拟 View 组件
const View = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string;
    style?: object;
    testID?: string;
  }>
>(({ className, style, testID, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={style}
    data-testid={testID}
    {...props}
  >
    {children}
  </div>
));
View.displayName = "View";

// 模拟 Text 组件
const Text = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithChildren<{
    className?: string;
    style?: object;
    testID?: string;
    numberOfLines?: number;
  }>
>(({ className, style, testID, children, numberOfLines, ...props }, ref) => (
  <span
    ref={ref}
    className={className}
    style={style}
    data-testid={testID}
    data-numberoflines={numberOfLines}
    {...props}
  >
    {children}
  </span>
));
Text.displayName = "Text";

// 模拟 TextInput 组件
const TextInput = React.forwardRef<
  HTMLInputElement,
  {
    className?: string;
    style?: object;
    testID?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    keyboardType?: string;
    secureTextEntry?: boolean;
  }
>(
  (
    {
      className,
      style,
      testID,
      onChangeText,
      keyboardType,
      secureTextEntry,
      ...props
    },
    ref,
  ) => (
    <input
      ref={ref}
      className={className}
      style={style}
      data-testid={testID}
      data-keyboardtype={keyboardType}
      type={secureTextEntry ? "password" : "text"}
      onChange={onChangeText ? (e) => onChangeText(e.target.value) : undefined}
      {...props}
    />
  ),
);
TextInput.displayName = "TextInput";

// 模拟 Pressable 组件
type PressableRenderProps = {
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
};

type PressableProps = {
  className?: string | ((state: PressableRenderProps) => string);
  style?: object | ((state: PressableRenderProps) => object);
  testID?: string;
  children?:
    | React.ReactNode
    | ((state: PressableRenderProps) => React.ReactNode);
  onPress?: () => void;
  disabled?: boolean;
};

const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  (
    { className, style, testID, children, onPress, disabled, ...props },
    ref,
  ) => {
    const [pressed, setPressed] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);

    const renderProps: PressableRenderProps = {
      pressed,
      hovered,
      focused: false,
    };
    const resolvedClassName =
      typeof className === "function" ? className(renderProps) : className;
    const resolvedStyle =
      typeof style === "function" ? style(renderProps) : style;
    const resolvedChildren =
      typeof children === "function" ? children(renderProps) : children;

    return (
      <button
        ref={ref}
        className={resolvedClassName}
        style={resolvedStyle}
        data-testid={testID}
        onClick={onPress}
        disabled={disabled}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {resolvedChildren}
      </button>
    );
  },
);
Pressable.displayName = "Pressable";

// 模拟 TouchableOpacity 组件
const TouchableOpacity = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<{
    className?: string;
    style?: object;
    testID?: string;
    onPress?: () => void;
    activeOpacity?: number;
    disabled?: boolean;
  }>
>(
  (
    {
      className,
      style,
      testID,
      children,
      onPress,
      activeOpacity,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={className}
      style={style}
      data-testid={testID}
      onClick={onPress}
      data-activeopacity={activeOpacity}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
);
TouchableOpacity.displayName = "TouchableOpacity";

// 模拟 Image 组件
type ImageSource = { uri: string } | number;
const Image = React.forwardRef<
  HTMLImageElement,
  {
    className?: string;
    style?: object;
    testID?: string;
    source?: ImageSource;
    resizeMode?: "cover" | "contain" | "stretch" | "center";
    alt?: string;
  }
>(({ className, style, testID, source, resizeMode, alt, ...props }, ref) => (
  <img
    ref={ref}
    className={className}
    style={style}
    data-testid={testID}
    src={typeof source === "object" && "uri" in source ? source.uri : undefined}
    data-resizemode={resizeMode}
    alt={alt}
    {...props}
  />
));
Image.displayName = "Image";

// 模拟 ScrollView 组件
const ScrollView = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string;
    style?: object;
    testID?: string;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
  }>
>(({ className, style, testID, children, horizontal, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={{
      overflow: "auto",
      ...(horizontal ? { overflowX: "auto" } : {}),
      ...style,
    }}
    data-testid={testID}
    data-horizontal={horizontal}
    {...props}
  >
    {children}
  </div>
));
ScrollView.displayName = "ScrollView";

// 模拟 SafeAreaView 组件
const SafeAreaView = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className?: string;
    style?: object;
    testID?: string;
  }>
>(({ className, style, testID, children, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    style={style}
    data-testid={testID}
    {...props}
  >
    {children}
  </div>
));
SafeAreaView.displayName = "SafeAreaView";

describe("twc for React Native", () => {
  beforeEach(cleanup);

  describe("Basic Component Creation", () => {
    test("creates a styled View component", () => {
      const Card = twc(View)`bg-white rounded-lg p-4`;
      render(<Card testID="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toBeDefined();
      expect(card.className).toBe("bg-white rounded-lg p-4");
    });

    test("creates a styled Text component", () => {
      const Title = twc(Text)`text-xl font-bold text-gray-900`;
      render(<Title testID="title">Hello World</Title>);
      const title = screen.getByTestId("title");
      expect(title).toBeDefined();
      expect(title.className).toBe("text-xl font-bold text-gray-900");
      expect(title.textContent).toBe("Hello World");
    });

    test("creates a styled TextInput component", () => {
      const Input = twc(TextInput)`border border-gray-300 rounded-md px-4 py-2`;
      render(<Input testID="input" placeholder="Enter text" />);
      const input = screen.getByTestId("input");
      expect(input).toBeDefined();
      expect(input.className).toBe(
        "border border-gray-300 rounded-md px-4 py-2",
      );
      expect(input.getAttribute("placeholder")).toBe("Enter text");
    });

    test("creates a styled Pressable component", () => {
      const Button = twc(Pressable)`bg-blue-500 py-2 px-4 rounded`;
      render(<Button testID="button">Press me</Button>);
      const button = screen.getByTestId("button");
      expect(button).toBeDefined();
      expect(button.className).toBe("bg-blue-500 py-2 px-4 rounded");
    });

    test("creates a styled TouchableOpacity component", () => {
      const TouchableButton = twc(
        TouchableOpacity,
      )`bg-green-500 p-3 rounded-full`;
      render(<TouchableButton testID="touchable">Tap me</TouchableButton>);
      const button = screen.getByTestId("touchable");
      expect(button).toBeDefined();
      expect(button.className).toBe("bg-green-500 p-3 rounded-full");
    });

    test("creates a styled Image component", () => {
      const Avatar = twc(Image)`w-12 h-12 rounded-full`;
      render(
        <Avatar
          testID="avatar"
          source={{ uri: "https://example.com/avatar.png" }}
        />,
      );
      const avatar = screen.getByTestId("avatar");
      expect(avatar).toBeDefined();
      expect(avatar.className).toBe("w-12 h-12 rounded-full");
    });

    test("creates a styled ScrollView component", () => {
      const StyledScrollView = twc(ScrollView)`flex-1 bg-gray-100`;
      render(<StyledScrollView testID="scroll">Content</StyledScrollView>);
      const scroll = screen.getByTestId("scroll");
      expect(scroll).toBeDefined();
      expect(scroll.className).toBe("flex-1 bg-gray-100");
    });

    test("creates a styled SafeAreaView component", () => {
      const Container = twc(SafeAreaView)`flex-1 bg-white`;
      render(<Container testID="container">Content</Container>);
      const container = screen.getByTestId("container");
      expect(container).toBeDefined();
      expect(container.className).toBe("flex-1 bg-white");
    });
  });

  describe("Props Handling", () => {
    test("forwards props correctly", () => {
      const Input = twc(TextInput)`border rounded`;
      render(
        <Input
          testID="input"
          placeholder="Email"
          keyboardType="email-address"
        />,
      );
      const input = screen.getByTestId("input");
      expect(input.getAttribute("placeholder")).toBe("Email");
      expect(input.getAttribute("data-keyboardtype")).toBe("email-address");
    });

    test("merges className with additional classes", () => {
      const Card = twc(View)`bg-white rounded`;
      render(
        <Card testID="card" className="shadow-lg">
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.className).toBe("bg-white rounded shadow-lg");
    });

    test("accepts clsx array classes", () => {
      const Card = twc(View)`bg-white`;
      render(
        <Card testID="card" className={["rounded", "p-4"]}>
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.className).toBe("bg-white rounded p-4");
    });

    test("forwards ref correctly", () => {
      const Card = twc(View)`bg-white`;
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card ref={ref} testID="card">
          Content
        </Card>,
      );
      expect(ref.current).toBeDefined();
      expect(ref.current?.getAttribute("data-testid")).toBe("card");
    });

    test("handles RN-specific props", () => {
      const StyledText = twc(Text)`text-lg`;
      render(
        <StyledText testID="text" numberOfLines={2}>
          Long text
        </StyledText>,
      );
      const text = screen.getByTestId("text");
      expect(text.getAttribute("data-numberoflines")).toBe("2");
    });
  });

  describe("Attrs Feature", () => {
    test("supports static attrs", () => {
      const EmailInput = twc(TextInput).attrs({
        keyboardType: "email-address",
        placeholder: "Enter email",
      })`border rounded px-4`;

      render(<EmailInput testID="email" />);
      const input = screen.getByTestId("email");
      expect(input.getAttribute("data-keyboardtype")).toBe("email-address");
      expect(input.getAttribute("placeholder")).toBe("Enter email");
    });

    test("supports dynamic attrs from props", () => {
      type SecureInputProps = TwcComponentProps<typeof TextInput> & {
        $secure?: boolean;
      };
      const SecureInput = twc(TextInput).attrs<SecureInputProps>((props) => ({
        secureTextEntry: props.$secure,
        placeholder: props.$secure ? "Enter password" : "Enter text",
      }))`border rounded`;

      render(<SecureInput testID="input" $secure />);
      const input = screen.getByTestId("input");
      expect(input.getAttribute("type")).toBe("password");
      expect(input.getAttribute("placeholder")).toBe("Enter password");
    });

    test("attrs can be overridden by props", () => {
      const Input = twc(TextInput).attrs({
        placeholder: "Default",
      })`border rounded`;

      render(<Input testID="input" placeholder="Custom" />);
      const input = screen.getByTestId("input");
      expect(input.getAttribute("placeholder")).toBe("Custom");
    });

    test("style from attrs and props are merged, not replaced", () => {
      const Card = twc(View).attrs({
        style: { backgroundColor: "white", padding: 10 },
      })`rounded`;

      render(
        <Card
          testID="card"
          style={{ margin: 20, backgroundColor: "blue" }}
        >
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      // style 应该是数组格式 [attrsStyle, propsStyle]
      const style = card.style;
      // React Native 会将数组展平，后面的覆盖前面的
      // 在测试环境中，我们验证 style 对象包含合并后的值
      expect(style.margin).toBe("20px");
      expect(style.backgroundColor).toBe("blue"); // 被覆盖
      expect(style.padding).toBe("10px"); // 保留
    });

    test("style from attrs works when props has no style", () => {
      const Card = twc(View).attrs({
        style: { backgroundColor: "white", padding: 10 },
      })`rounded`;

      render(<Card testID="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.style.backgroundColor).toBe("white");
      expect(card.style.padding).toBe("10px");
    });

    test("style from props works when attrs has no style", () => {
      const Card = twc(View).attrs({
        "aria-label": "card",
      })`rounded`;

      render(
        <Card testID="card" style={{ margin: 20 }}>
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.style.margin).toBe("20px");
    });

    test("dynamic attrs style is also merged with props style", () => {
      type Props = TwcComponentProps<typeof View> & { $padded?: boolean };
      const Card = twc(View).attrs<Props>((props) => ({
        style: { padding: props.$padded ? 20 : 0 },
      }))`rounded`;

      render(
        <Card testID="card" $padded style={{ margin: 10 }}>
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.style.padding).toBe("20px");
      expect(card.style.margin).toBe("10px");
    });
  });

  describe("Transient Props", () => {
    test("filters transient props starting with $", () => {
      type Props = TwcComponentProps<typeof Pressable> & {
        $variant: "primary" | "secondary";
      };
      const Button = twc(Pressable)<Props>((props) => ({
        "bg-blue-500 text-white": props.$variant === "primary",
        "bg-gray-200 text-gray-800": props.$variant === "secondary",
      }));

      render(
        <Button testID="button" $variant="primary">
          Click
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button.getAttribute("$variant")).toBeNull();
      expect(button.className).toContain("bg-blue-500");
      expect(button.className).toContain("text-white");
    });

    test("allows custom transient props using array", () => {
      type Props = TwcComponentProps<typeof View> & {
        variant: "small" | "large";
      };
      const Badge = twc(View).transientProps(["variant"])<Props>((props) => ({
        "px-2 py-1 text-sm": props.variant === "small",
        "px-4 py-2 text-lg": props.variant === "large",
      }));

      render(
        <Badge testID="badge" variant="large">
          Badge
        </Badge>,
      );
      const badge = screen.getByTestId("badge");
      expect(badge.getAttribute("variant")).toBeNull();
      expect(badge.className).toContain("px-4");
      expect(badge.className).toContain("py-2");
    });

    test("allows custom transient props using function", () => {
      type Props = TwcComponentProps<typeof View> & {
        size: "sm" | "md" | "lg";
      };
      const Chip = twc(View).transientProps((prop) => prop === "size")<Props>(
        (props) => ({
          "h-6": props.size === "sm",
          "h-8": props.size === "md",
          "h-10": props.size === "lg",
        }),
      );

      render(
        <Chip testID="chip" size="md">
          Chip
        </Chip>,
      );
      const chip = screen.getByTestId("chip");
      expect(chip.getAttribute("size")).toBeNull();
      expect(chip.className).toContain("h-8");
    });

    test("transient props work with attrs", () => {
      type Props = TwcComponentProps<typeof Pressable> & {
        $type: "submit" | "reset";
      };
      const FormButton = twc(Pressable)
        .transientProps(["$type"])
        .attrs<Props>(({ $type }) => ({
          "aria-label": $type === "submit" ? "Submit form" : "Reset form",
        }))`bg-blue-500`;

      render(
        <FormButton testID="btn" $type="submit">
          Submit
        </FormButton>,
      );
      const button = screen.getByTestId("btn");
      expect(button.getAttribute("$type")).toBeNull();
      expect(button.getAttribute("aria-label")).toBe("Submit form");
    });
  });

  describe("Dynamic className (Function)", () => {
    test("accepts function to define className", () => {
      type Props = TwcComponentProps<typeof Pressable> & { $active: boolean };
      const Tab = twc(Pressable)<Props>((props) => ({
        "bg-blue-500 text-white": props.$active,
        "bg-gray-100 text-gray-600": !props.$active,
      }));

      render(
        <Tab testID="tab" $active>
          Active Tab
        </Tab>,
      );
      const tab = screen.getByTestId("tab");
      expect(tab.className).toContain("bg-blue-500");
      expect(tab.className).toContain("text-white");
    });

    test("accepts function returning string", () => {
      type Props = TwcComponentProps<typeof View> & { $size: "sm" | "lg" };
      const Box = twc(View)<Props>((props) =>
        props.$size === "sm" ? "w-4 h-4" : "w-8 h-8",
      );

      render(
        <Box testID="box" $size="lg">
          Box
        </Box>,
      );
      const box = screen.getByTestId("box");
      expect(box.className).toBe("w-8 h-8");
    });
  });

  describe("CVA Integration", () => {
    test("works with class-variance-authority", () => {
      const buttonVariants = cva(["font-semibold", "rounded-lg"], {
        variants: {
          $intent: {
            primary: ["bg-blue-500", "text-white"],
            secondary: ["bg-gray-100", "text-gray-900"],
            danger: ["bg-red-500", "text-white"],
          },
          $size: {
            sm: ["py-1", "px-2", "text-sm"],
            md: ["py-2", "px-4", "text-base"],
            lg: ["py-3", "px-6", "text-lg"],
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
        buttonVariants({ $intent, $size }),
      );

      render(
        <Button testID="button" $intent="danger" $size="lg">
          Delete
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button.className).toContain("bg-red-500");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("py-3");
      expect(button.className).toContain("px-6");
      expect(button.getAttribute("$intent")).toBeNull();
      expect(button.getAttribute("$size")).toBeNull();
    });
  });

  describe("Tailwind Merge Integration", () => {
    test("works with tailwind-merge for class conflicts", () => {
      const twx = createTwc({
        compose: twMerge,
      });

      const Title = twx(Text)`font-bold text-lg`;

      render(
        <Title testID="title" className="font-normal text-sm">
          Title
        </Title>,
      );
      const title = screen.getByTestId("title");
      // tailwind-merge should resolve conflicts, keeping the later classes
      expect(title.className).toContain("font-normal");
      expect(title.className).toContain("text-sm");
      expect(title.className).not.toContain("font-bold");
      expect(title.className).not.toContain("text-lg");
    });

    test("tailwind-merge preserves non-conflicting classes", () => {
      const twx = createTwc({
        compose: twMerge,
      });

      const Card = twx(View)`bg-white rounded-lg`;

      render(
        <Card testID="card" className="shadow-lg p-4">
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.className).toContain("bg-white");
      expect(card.className).toContain("rounded-lg");
      expect(card.className).toContain("shadow-lg");
      expect(card.className).toContain("p-4");
    });
  });

  describe("Render Props Support", () => {
    test("supports render props for className", () => {
      type Props = TwcComponentProps<typeof Pressable>;
      const InteractiveButton = twc(Pressable)<Props>(
        () => (renderProps: PressableRenderProps) =>
          renderProps.pressed ? "bg-blue-700 scale-95" : "bg-blue-500",
      );

      render(<InteractiveButton testID="button">Press</InteractiveButton>);
      const button = screen.getByTestId("button");
      // Initial state (not pressed)
      expect(button.className).toBe("bg-blue-500");
    });

    test("merges render props className with provided className", () => {
      type Props = TwcComponentProps<typeof Pressable>;
      const Button = twc(Pressable)<Props>(
        () => (renderProps: PressableRenderProps) =>
          renderProps.hovered ? "bg-blue-600" : "bg-blue-500",
      );

      render(
        <Button
          testID="button"
          className={(props: PressableRenderProps) =>
            props.pressed ? "scale-95" : ""
          }
        >
          Hover me
        </Button>,
      );
      const button = screen.getByTestId("button");
      // clsx filters out empty strings, so the result is just "bg-blue-500"
      expect(button.className).toBe("bg-blue-500");
    });
  });

  describe("Custom Configuration", () => {
    test("createTwc with custom shouldForwardProp", () => {
      const twx = createTwc({
        shouldForwardProp: (prop) => !prop.startsWith("_"),
      });

      type Props = TwcComponentProps<typeof Pressable> & {
        _variant: "primary" | "secondary";
      };
      const Button = twx(Pressable)<Props>((props) => ({
        "bg-blue-500": props._variant === "primary",
        "bg-gray-500": props._variant === "secondary",
      }));

      render(
        <Button testID="button" _variant="primary">
          Click
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button.getAttribute("_variant")).toBeNull();
      expect(button.className).toContain("bg-blue-500");
    });

    test("createTwc with custom compose function", () => {
      const customCompose = (...classes: string[]) =>
        classes.filter(Boolean).join(" | ");
      const twx = createTwc({
        compose: customCompose,
      });

      const Card = twx(View)`bg-white`;

      render(
        <Card testID="card" className="rounded">
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.className).toBe("bg-white | rounded");
    });
  });

  describe("Component Composition", () => {
    test("nested styled components work correctly", () => {
      const Container = twc(View)`flex-1 p-4`;
      const Header = twc(View)`flex-row items-center`;
      const Title = twc(Text)`text-xl font-bold`;

      render(
        <Container testID="container">
          <Header testID="header">
            <Title testID="title">Hello</Title>
          </Header>
        </Container>,
      );

      expect(screen.getByTestId("container").className).toBe("flex-1 p-4");
      expect(screen.getByTestId("header").className).toBe(
        "flex-row items-center",
      );
      expect(screen.getByTestId("title").className).toBe("text-xl font-bold");
    });

    test("extends another styled component by wrapping", () => {
      const BaseButton = twc(Pressable)`py-2 px-4 rounded`;
      const PrimaryButton = twc(BaseButton)`bg-blue-500 text-white`;

      render(<PrimaryButton testID="button">Click</PrimaryButton>);
      const button = screen.getByTestId("button");
      // Should have both base and extended classes
      expect(button.className).toContain("py-2");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("rounded");
      expect(button.className).toContain("bg-blue-500");
      expect(button.className).toContain("text-white");
    });
  });

  describe("DisplayName", () => {
    test("sets correct displayName for debugging", () => {
      const StyledView = twc(View)`bg-white`;
      expect(StyledView.displayName).toBe("twc(View)");
    });

    test("uses Component.displayName if available", () => {
      const CustomComponent = React.forwardRef<
        HTMLDivElement,
        { className?: string }
      >((props, ref) => <div ref={ref} {...props} />);
      CustomComponent.displayName = "MyCustomComponent";

      const StyledCustom = twc(CustomComponent)`bg-white`;
      expect(StyledCustom.displayName).toBe("twc(MyCustomComponent)");
    });

    test("uses Component.name as fallback", () => {
      function NamedComponent(props: { className?: string }) {
        return <div {...props} />;
      }

      const StyledNamed = twc(NamedComponent)`bg-white`;
      expect(StyledNamed.displayName).toBe("twc(NamedComponent)");
    });
  });

  describe("Edge Cases", () => {
    test("handles empty className", () => {
      const Card = twc(View)``;
      render(
        <Card testID="card" className="p-4">
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card.className).toBe("p-4");
    });

    test("handles undefined className prop", () => {
      const Card = twc(View)`bg-white`;
      render(<Card testID="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toBe("bg-white");
    });

    test("handles complex template string with interpolation", () => {
      const baseClasses = "p-4 rounded-lg";
      const Card = twc(View)`${baseClasses} bg-white shadow`;
      render(<Card testID="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toBe("p-4 rounded-lg bg-white shadow");
    });

    test("handles multiline template string", () => {
      const Card = twc(View)`
        bg-white
        rounded-lg
        shadow-md
        p-4
      `;
      render(<Card testID="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("bg-white");
      expect(card.className).toContain("rounded-lg");
      expect(card.className).toContain("shadow-md");
      expect(card.className).toContain("p-4");
    });
  });

  describe("Type Safety", () => {
    test("TwcComponentProps extracts correct props", () => {
      type CardProps = TwcComponentProps<typeof View>;
      const Card = twc(View)<CardProps>`bg-white`;
      // This should type-check correctly
      render(
        <Card testID="card" style={{ margin: 10 }}>
          Content
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card).toBeDefined();
    });

    test("custom props type restricts props correctly", () => {
      type ButtonProps = {
        children: React.ReactNode;
        className?: string;
        $loading?: boolean;
      };
      const Button = twc(Pressable)<ButtonProps>((props) =>
        props.$loading ? "opacity-50" : "",
      );

      render(
        // @ts-expect-error - invalidProp should not be allowed if types work
        <Button testID="button" invalidProp>
          Click
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button).toBeDefined();
    });
  });

  describe("Real-world Patterns", () => {
    test("creates a complete card component", () => {
      const Card = twc(View)`bg-white rounded-xl shadow-lg overflow-hidden`;
      const CardHeader = twc(View)`px-4 py-3 border-b border-gray-100`;
      const CardTitle = twc(Text)`text-lg font-semibold text-gray-900`;
      const CardContent = twc(View)`p-4`;
      const CardFooter = twc(View)`px-4 py-3 bg-gray-50 flex-row justify-end`;

      render(
        <Card testID="card">
          <CardHeader testID="header">
            <CardTitle testID="title">Card Title</CardTitle>
          </CardHeader>
          <CardContent testID="content">
            <Text>Card content goes here</Text>
          </CardContent>
          <CardFooter testID="footer">
            <Text>Footer</Text>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByTestId("card").className).toContain("bg-white");
      expect(screen.getByTestId("header").className).toContain("border-b");
      expect(screen.getByTestId("title").className).toContain("font-semibold");
      expect(screen.getByTestId("content").className).toContain("p-4");
      expect(screen.getByTestId("footer").className).toContain("bg-gray-50");
    });

    test("creates a button with variants using CVA", () => {
      const buttonVariants = cva(["rounded-lg", "font-medium"], {
        variants: {
          $variant: {
            solid: "",
            outline: "border-2 bg-transparent",
            ghost: "bg-transparent",
          },
          $color: {
            primary: "",
            secondary: "",
            danger: "",
          },
        },
        compoundVariants: [
          {
            $variant: "solid",
            $color: "primary",
            className: "bg-blue-500 text-white",
          },
          {
            $variant: "solid",
            $color: "secondary",
            className: "bg-gray-500 text-white",
          },
          {
            $variant: "solid",
            $color: "danger",
            className: "bg-red-500 text-white",
          },
          {
            $variant: "outline",
            $color: "primary",
            className: "border-blue-500 text-blue-500",
          },
          {
            $variant: "outline",
            $color: "danger",
            className: "border-red-500 text-red-500",
          },
          { $variant: "ghost", $color: "primary", className: "text-blue-500" },
        ],
        defaultVariants: {
          $variant: "solid",
          $color: "primary",
        },
      });

      type ButtonProps = TwcComponentProps<typeof Pressable> &
        VariantProps<typeof buttonVariants>;

      const Button = twc(Pressable)<ButtonProps>(({ $variant, $color }) =>
        buttonVariants({ $variant, $color }),
      );

      render(
        <Button testID="button" $variant="outline" $color="danger">
          Delete
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button.className).toContain("border-red-500");
      expect(button.className).toContain("text-red-500");
      expect(button.getAttribute("$variant")).toBeNull();
      expect(button.getAttribute("$color")).toBeNull();
    });

    test("creates form input with validation states", () => {
      type InputProps = TwcComponentProps<typeof TextInput> & {
        $error?: boolean;
        $success?: boolean;
      };

      const FormInput = twc(TextInput)<InputProps>((props) => [
        "border rounded-lg px-4 py-2 w-full",
        {
          "border-gray-300 focus:border-blue-500":
            !props.$error && !props.$success,
          "border-red-500 bg-red-50": props.$error,
          "border-green-500 bg-green-50": props.$success,
        },
      ]);

      // Error state
      render(<FormInput testID="input-error" $error placeholder="Email" />);
      const errorInput = screen.getByTestId("input-error");
      expect(errorInput.className).toContain("border-red-500");
      expect(errorInput.className).toContain("bg-red-50");

      cleanup();

      // Success state
      render(<FormInput testID="input-success" $success placeholder="Email" />);
      const successInput = screen.getByTestId("input-success");
      expect(successInput.className).toContain("border-green-500");
      expect(successInput.className).toContain("bg-green-50");
    });
  });

  describe("withChildren Feature", () => {
    test("renders string children using renderer", () => {
      const Button = twc(Pressable).withChildren((children) => (
        <Text className="text-white font-bold">{children}</Text>
      ))`bg-blue-500 py-2 px-4 rounded`;

      render(<Button testID="button">Click me</Button>);
      const button = screen.getByTestId("button");
      expect(button.className).toBe("bg-blue-500 py-2 px-4 rounded");
      expect(button.textContent).toBe("Click me");
      // 内部的 Text 组件应该有正确的 className
      const innerText = button.querySelector("span");
      expect(innerText?.className).toBe("text-white font-bold");
    });

    test("wraps ReactNode children with renderer", () => {
      const Card = twc(View).withChildren((children) => (
        <View className="wrapper" testID="wrapper">
          {children}
        </View>
      ))`bg-white p-4 rounded`;

      render(
        <Card testID="card">
          <Text testID="custom">Custom Content</Text>
        </Card>,
      );
      // ReactNode children 应该被渲染器包裹
      expect(screen.getByTestId("wrapper")).toBeDefined();
      expect(screen.getByTestId("custom")).toBeDefined();
      expect(screen.getByTestId("custom").textContent).toBe("Custom Content");
    });

    test("withChildren works with attrs", () => {
      const FloatButton = twc(Pressable)
        .attrs({ "aria-label": "Float action button" })
        .withChildren((children) => (
          <Text className="text-white text-lg">{children}</Text>
        ))`absolute bottom-4 right-4 bg-purple-500 rounded-full p-4`;

      render(<FloatButton testID="fab">Add</FloatButton>);
      const fab = screen.getByTestId("fab");
      expect(fab.getAttribute("aria-label")).toBe("Float action button");
      expect(fab.textContent).toBe("Add");
      const innerText = fab.querySelector("span");
      expect(innerText?.className).toBe("text-white text-lg");
    });

    test("withChildren works with transientProps", () => {
      type Props = TwcComponentProps<typeof Pressable> & {
        $variant: "primary" | "secondary";
      };
      const Button = twc(Pressable)
        .transientProps(["$variant"])
        .withChildren((children) => (
          <Text className="font-medium">{children}</Text>
        ))<Props>((props) => ({
        "bg-blue-500": props.$variant === "primary",
        "bg-gray-200": props.$variant === "secondary",
      }));

      render(
        <Button testID="button" $variant="primary">
          Primary
        </Button>,
      );
      const button = screen.getByTestId("button");
      expect(button.getAttribute("$variant")).toBeNull();
      expect(button.className).toContain("bg-blue-500");
      expect(button.textContent).toBe("Primary");
    });

    test("withChildren handles empty string children", () => {
      const Button = twc(Pressable).withChildren((children) => (
        <Text className="text-white">{children || "Default"}</Text>
      ))`bg-blue-500`;

      render(<Button testID="button">{""}</Button>);
      const button = screen.getByTestId("button");
      expect(button.textContent).toBe("Default");
    });

    test("withChildren handles undefined children", () => {
      const Button = twc(Pressable).withChildren((children) => (
        <Text className="text-white">{children ?? "Fallback"}</Text>
      ))`bg-blue-500`;

      render(<Button testID="button" />);
      const button = screen.getByTestId("button");
      // undefined children 也会经过渲染器，渲染器内部处理 fallback
      expect(button.textContent).toBe("Fallback");
    });

    test("withChildren wraps complex ReactNode", () => {
      const Container = twc(View).withChildren((children) => (
        <View className="inner-wrapper" testID="inner">
          <Text className="prefix">Prefix: </Text>
          {children}
        </View>
      ))`bg-gray-100`;

      render(
        <Container testID="container">
          <View testID="child1">Child 1</View>
          <View testID="child2">Child 2</View>
        </Container>,
      );

      expect(screen.getByTestId("inner")).toBeDefined();
      expect(screen.getByTestId("child1")).toBeDefined();
      expect(screen.getByTestId("child2")).toBeDefined();
    });

    test("withChildren with generic type for string-only children", () => {
      // 使用泛型指定 children 只接受 string 类型
      const FloatButton = twc(Pressable).withChildren<string>((text) => (
        <Text className="text-white text-lg font-bold">{text.toUpperCase()}</Text>
      ))`bg-purple-500 rounded-full p-4`;

      render(<FloatButton testID="fab">submit</FloatButton>);
      const fab = screen.getByTestId("fab");
      // text.toUpperCase() 应该生效
      expect(fab.textContent).toBe("SUBMIT");
    });

    test("withChildren generic type with optional string", () => {
      // children 类型为 string | undefined
      const Button = twc(Pressable).withChildren<string | undefined>((text) => (
        <Text className="text-white">{text ?? "默认文本"}</Text>
      ))`bg-blue-500`;

      // 不传 children
      render(<Button testID="btn1" />);
      expect(screen.getByTestId("btn1").textContent).toBe("默认文本");

      cleanup();

      // 传 string
      render(<Button testID="btn2">自定义</Button>);
      expect(screen.getByTestId("btn2").textContent).toBe("自定义");
    });
  });
});
