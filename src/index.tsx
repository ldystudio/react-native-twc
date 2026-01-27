import { type ClassValue, clsx } from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export { clsx as cx };

type AbstractCompose = (...params: any) => any;

/**
 * React Native 组件类型定义
 * 支持任何接受 className 或 style prop 的 React Native 组件
 */
type RNComponentType = React.ComponentType<any>;

/**
 * 获取组件的 Props 类型
 */
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * 结果 Props 类型
 * 根据泛型参数组合最终的 props 类型
 */
type ResultProps<
    TComponent extends RNComponentType,
    TProps,
    TExtraProps,
    TCompose extends AbstractCompose,
> = TProps extends undefined
    ? TExtraProps extends undefined
        ? Omit<ComponentProps<TComponent>, 'className'> & {
              className?: Parameters<TCompose>[0];
          }
        : Omit<ComponentProps<TComponent>, 'className'> & {
              className?: Parameters<TCompose>[0];
          } & TExtraProps
    : TProps;

/**
 * 模板函数类型
 * 支持模板字符串语法和函数形式
 */
type Template<
    TComponent extends RNComponentType,
    TCompose extends AbstractCompose,
    TExtraProps,
    TParentProps = undefined,
> = <TProps = TParentProps>(
    strings:
        | TemplateStringsArray
        | ((
              props: ResultProps<TComponent, TProps, TExtraProps, TCompose>
          ) => 'className' extends keyof TProps ? TProps['className'] : Parameters<TCompose>[0]),
    ...values: any[]
) => React.ForwardRefExoticComponent<ResultProps<TComponent, TProps, TExtraProps, TCompose>>;

/**
 * Children 渲染器类型
 * 用于包裹 children 并返回 ReactNode
 * TChildren 默认为 React.ReactNode，但可以指定为更具体的类型如 string
 */
type ChildrenRenderer<TChildren = React.ReactNode> = (children: TChildren) => React.ReactNode;

/**
 * 带 withChildren 的模板类型
 * 用于 attrs 返回后仍可调用 withChildren
 */
type TemplateWithChildren<
    TComponent extends RNComponentType,
    TCompose extends AbstractCompose,
    TExtraProps,
    TParentProps = undefined,
> = Template<TComponent, TCompose, TExtraProps, TParentProps> & {
    /**
     * 预定义 children 的渲染方式
     * 可通过泛型指定 children 类型，默认为 React.ReactNode
     * @example
     * // 默认接受任意 ReactNode
     * const Card = twc(View).withChildren((children) => <Wrapper>{children}</Wrapper>)`...`
     * // 指定只接受 string
     * const Button = twc(Pressable).withChildren<string>((text) => <Text>{text}</Text>)`...`
     */
    withChildren: <TChildren = React.ReactNode>(
        renderer: ChildrenRenderer<TChildren>
    ) => Template<TComponent, TCompose, TExtraProps, TParentProps>;
};

/**
 * 第一级模板类型
 * 包含 attrs、transientProps 和 withChildren 方法
 */
type FirstLevelTemplate<
    TComponent extends RNComponentType,
    TCompose extends AbstractCompose,
    TExtraProps,
> = Template<TComponent, TCompose, TExtraProps> & {
    /**
     * 为组件添加额外的默认 props
     * @example
     * const TextInput = twc(RNTextInput).attrs({ keyboardType: 'email-address' })`...`
     */
    attrs: <TProps = undefined>(
        attrs:
            | (Omit<Partial<ComponentProps<TComponent>>, 'className'> & Record<string, any>)
            | ((
                  props: ResultProps<TComponent, TProps, TExtraProps, TCompose>
              ) => Record<string, any>)
    ) => TemplateWithChildren<TComponent, TCompose, TExtraProps, TProps>;
} & {
    /**
     * 防止特定 props 被转发到底层组件
     * @example
     * const Title = twc(Text).transientProps(['$size'])`...`
     */
    transientProps: (
        fn: string[] | ((prop: string) => boolean)
    ) => FirstLevelTemplate<TComponent, TCompose, TExtraProps>;
} & {
    /**
     * 预定义 children 的渲染方式
     * 可通过泛型指定 children 类型，默认为 React.ReactNode
     * @example
     * // 默认接受任意 ReactNode
     * const Card = twc(View).withChildren((children) => <Wrapper>{children}</Wrapper>)`...`
     * // 指定只接受 string
     * const Button = twc(Pressable).withChildren<string>((text) => <Text>{text}</Text>)`...`
     */
    withChildren: <TChildren = React.ReactNode>(
        renderer: ChildrenRenderer<TChildren>
    ) => FirstLevelTemplate<TComponent, TCompose, TExtraProps>;
};

/**
 * TWC 主类型
 * 只支持传入 React Native 组件，不支持字符串标签
 */
type Twc<TCompose extends AbstractCompose> = <T extends RNComponentType>(
    component: T
) => FirstLevelTemplate<T, TCompose, undefined>;

/**
 * TWC 组件 Props 工具类型
 * 用于获取 TWC 组件的 props 类型
 */
export type TwcComponentProps<
    TComponent extends RNComponentType,
    TCompose extends AbstractCompose = typeof clsx,
> = ResultProps<TComponent, undefined, undefined, TCompose>;

/**
 * 配置类型
 */
export type Config<TCompose extends AbstractCompose> = {
    /**
     * className 合并函数，默认使用 clsx
     * 可以替换为 tailwind-merge 等库
     */
    compose?: TCompose;
    /**
     * 判断 prop 是否应该转发到底层组件的函数
     * 默认规则: prop => prop[0] !== "$" (以 $ 开头的不转发)
     */
    shouldForwardProp?: (prop: string) => boolean;
};

/**
 * 过滤 props，移除不应转发的 props
 * 使用 for 循环以获得最佳性能
 */
function filterProps(
    props: Record<string, any>,
    shouldForwardProp: (prop: string) => boolean
): Record<string, any> {
    const filteredProps: Record<string, any> = {};
    const keys = Object.keys(props);
    for (let i = 0; i < keys.length; i++) {
        const prop = keys[i];
        if (shouldForwardProp(prop)) {
            filteredProps[prop] = props[prop];
        }
    }
    return filteredProps;
}

/**
 * 展平 style（处理数组和嵌套数组）
 */
function flattenStyle(style: any): Record<string, any> {
    if (style == null) return {};
    if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...flattenStyle(s) }), {});
    }
    return style;
}

/**
 * 合并 style 属性
 * 将 baseStyle 和 overrideStyle 合并为单个对象
 * @param baseStyle - 基础 style (来自 attrs)
 * @param overrideStyle - 覆盖 style (来自 props)
 * @returns 合并后的 style 对象
 */
function mergeStyles(baseStyle: any, overrideStyle: any): any {
    if (baseStyle == null) return overrideStyle;
    if (overrideStyle == null) return baseStyle;
    // 展平并合并，后者覆盖前者的同名属性
    return { ...flattenStyle(baseStyle), ...flattenStyle(overrideStyle) };
}

/**
 * 合并 attrs 和 props，对 style 进行特殊处理
 */
function mergePropsWithAttrs(
    attrs: Record<string, any>,
    props: Record<string, any>
): Record<string, any> {
    const merged = { ...attrs, ...props };
    // 如果两者都有 style，则合并而不是覆盖
    if (attrs.style != null && props.style != null) {
        merged.style = mergeStyles(attrs.style, props.style);
    }
    return merged;
}

type Attributes = Record<string, any> | ((props: any) => Record<string, any>);

/**
 * 创建 TWC 实例的工厂函数
 *
 * @param config - 配置选项
 * @returns TWC 实例
 *
 * @example
 * // 基础使用
 * import { View, Text } from 'react-native';
 * const twc = createTwc();
 * const Card = twc(View)`bg-white rounded-lg p-4`;
 * const Title = twc(Text)`text-xl font-bold`;
 *
 * @example
 * // 使用 tailwind-merge
 * import { twMerge } from 'tailwind-merge';
 * const twc = createTwc({ compose: twMerge });
 */
export const createTwc = <TCompose extends AbstractCompose = typeof clsx>(
    config: Config<TCompose> = {}
): Twc<TCompose> => {
    const compose = config.compose || clsx;
    const defaultShouldForwardProp = config.shouldForwardProp || ((prop) => prop[0] !== '$');

    const wrap = <T extends RNComponentType>(Component: T) => {
        const createTemplate = (
            attrs?: Attributes,
            shouldForwardProp = defaultShouldForwardProp,
            childrenRenderer?: ChildrenRenderer
        ) => {
            // 缓存已创建的组件，避免重复创建
            const componentCache = new Map<string, React.ForwardRefExoticComponent<any>>();

            const template = (stringsOrFn: TemplateStringsArray | Function, ...values: any[]) => {
                // 判断是否为函数形式的 className
                const isClassFn = typeof stringsOrFn === 'function';

                // 生成缓存 key
                const cacheKey = isClassFn
                    ? stringsOrFn.toString()
                    : String.raw({ raw: stringsOrFn }, ...values);

                // 检查缓存
                if (componentCache.has(cacheKey)) {
                    return componentCache.get(cacheKey)!;
                }

                // 解析模板字符串（仅在非函数时）
                const tplClassName = !isClassFn ? cacheKey : undefined;

                // 优化：提前检查 attrs 类型，避免每次渲染都检查
                const hasAttrs = attrs !== undefined;
                const isAttrsFunction = typeof attrs === 'function';
                const staticAttrs = !isAttrsFunction && hasAttrs ? attrs : undefined;

                // 使用 forwardRef 支持 ref 转发
                const ForwardedComponent = React.forwardRef((p: any, ref) => {
                    const { className: classNameProp, children, ...rest } = p;

                    // 处理 attrs (静态或动态)
                    let finalProps: Record<string, any>;

                    if (!hasAttrs) {
                        // 没有 attrs，直接过滤 rest
                        finalProps = filterProps(rest, shouldForwardProp);
                    } else if (isAttrsFunction) {
                        // 动态 attrs
                        const resolvedAttrs = (attrs as Function)(p);
                        finalProps = filterProps(
                            mergePropsWithAttrs(resolvedAttrs, rest),
                            shouldForwardProp
                        );
                    } else {
                        // 静态 attrs
                        finalProps = filterProps(
                            mergePropsWithAttrs(staticAttrs!, rest),
                            shouldForwardProp
                        );
                    }

                    // 计算最终的 className
                    const baseClassName = isClassFn ? (stringsOrFn as Function)(p) : tplClassName;

                    // 优化：避免不必要的函数包装
                    const finalClassName =
                        typeof baseClassName === 'function'
                            ? (renderProps: any) =>
                                  compose(
                                      baseClassName(renderProps),
                                      typeof classNameProp === 'function'
                                          ? classNameProp(renderProps)
                                          : classNameProp
                                  )
                            : compose(baseClassName, classNameProp);

                    // 处理 children：如果有渲染器则使用渲染器包裹
                    const finalChildren = childrenRenderer
                        ? childrenRenderer(children)
                        : children;

                    const Comp = Component as React.ComponentType<any>;
                    return (
                        <Comp ref={ref} className={finalClassName} {...finalProps}>
                            {finalChildren}
                        </Comp>
                    );
                });

                // 设置 displayName 便于调试
                ForwardedComponent.displayName = `twc(${
                    Component.displayName || Component.name || 'Component'
                })`;

                // 缓存组件
                componentCache.set(cacheKey, ForwardedComponent);

                return ForwardedComponent;
            };

            // transientProps 方法: 自定义哪些 props 不应转发
            template.transientProps = (fnOrArray: string[] | ((prop: string) => boolean)) => {
                const newShouldForwardProp =
                    typeof fnOrArray === 'function'
                        ? (prop: string) => !fnOrArray(prop)
                        : (prop: string) => !fnOrArray.includes(prop);
                return createTemplate(attrs, newShouldForwardProp, childrenRenderer);
            };

            // withChildren 方法: 预定义 children 的渲染方式
            template.withChildren = (renderer: ChildrenRenderer) => {
                return createTemplate(attrs, shouldForwardProp, renderer);
            };

            // attrs 方法: 添加默认 props (仅在未设置 attrs 时可用)
            if (attrs === undefined) {
                template.attrs = (newAttrs: Attributes) => {
                    return createTemplate(newAttrs, shouldForwardProp, childrenRenderer);
                };
            }

            return template;
        };

        return createTemplate();
    };

    // 直接返回 wrap 函数，不使用 Proxy
    // React Native 不需要支持字符串标签 (如 'div', 'span')
    return wrap as Twc<TCompose>;
};

/**
 * 默认的 TWC 实例
 * 使用 clsx 作为 compose 函数
 */
export const twc = createTwc();

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * 带tailwind-merge的 TWC 实例
 * 使用 cn 作为 compose 函数
 */
export const twx = createTwc({ compose: cn });
