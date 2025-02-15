export type PositionType = {
    x: number;
    y: number;
    width: number;
    height: number;
    imageHeight: number;
};
export type BaseInfo = {
    id: string;
    width: number;
    height: number;
};
export type WaterFallProps<T> = {
    list: T[];
    columns?: number;
    gap?: number;
    cardClass?: string;
    reachBottom?: () => void;
    calcCardHeight?: (cardWidth: number, imageHeight: number, item: T) => Promise<number>;
    renderItem?: (props: {
        item: T & {
            style: PositionType;
        };
    }) => JSX.Element;
    renderLoading?: () => JSX.Element | null;
};
export declare function VirtualWaterFall<T extends BaseInfo>(props: WaterFallProps<T>): import("react/jsx-runtime").JSX.Element;
