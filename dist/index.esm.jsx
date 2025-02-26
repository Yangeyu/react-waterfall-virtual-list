import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useRef, useMemo } from 'react';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const usePageSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    function onResize() {
        setSize({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight });
    }
    useEffect(() => {
        onResize();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
    return size;
};

function VirtualWaterFall(props) {
    const { columns = 5, gap = 10, scrollSpeedFactor = 0.3, list, } = props;
    const containerRef = useRef();
    const [listWithPos, setListWithPos] = useState([]);
    const pageSize = usePageSize();
    const [scrollState, setScrollState] = useState({
        viewWidth: 0,
        viewHeight: 0,
    });
    const [top, setTop] = useState(0);
    const columnsHeight = useRef(Array.from({ length: columns }, () => 0));
    const renderList = useMemo(() => {
        if (listWithPos.length === 0)
            return [];
        return listWithPos.filter((item) => {
            return item.style.y + item.style.height >= top &&
                item.style.y < top + scrollState.viewHeight;
        });
    }, [listWithPos, top]);
    // 计算最小列的索引和高度
    const calcMinColumns = () => {
        const minHeight = Math.min(...columnsHeight.current);
        const idx = columnsHeight.current.indexOf(minHeight);
        return [idx, minHeight];
    };
    // 计算每个项目的位置
    const calcItemsPos = (cardWidth) => __awaiter(this, void 0, void 0, function* () {
        if (!(list === null || list === void 0 ? void 0 : list.length))
            return [];
        // 初始化列高数组，每列的初始高度为0
        columnsHeight.current = Array.from({ length: columns }, () => 0);
        const result = [];
        for (const item of list) {
            const imageHeight = item.height * cardWidth / (item === null || item === void 0 ? void 0 : item.width);
            const cardHeight = props.calcCardHeight
                ? yield props.calcCardHeight(cardWidth, imageHeight, item)
                : imageHeight;
            // 找到最小列的索引和高度
            const [minColumnIdx, minHeight] = calcMinColumns();
            // 更新最小列的高度
            columnsHeight.current[minColumnIdx] += cardHeight + gap;
            const style = {
                x: (cardWidth + gap) * minColumnIdx,
                y: minHeight,
                width: cardWidth,
                height: cardHeight,
                imageHeight
            };
            result.push(Object.assign(Object.assign({}, item), { style }));
        }
        return result;
    });
    useEffect(() => {
        var _a;
        const containerWidth = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.clientWidth;
        const cardWidth = (containerWidth - gap * (columns - 1)) / columns;
        calcItemsPos(cardWidth).then((res) => { setListWithPos(res); });
    }, [list, pageSize]);
    useEffect(() => {
        var _a;
        if (top === 0)
            return;
        if (top + scrollState.viewHeight >= Math.max(...columnsHeight.current)) {
            (_a = props.reachBottom) === null || _a === void 0 ? void 0 : _a.call(props);
        }
    }, [top]);
    useEffect(() => {
        var _a;
        const handleScroll = ((ev) => {
            var _a;
            ev.preventDefault();
            // 获取滚动距离（可以根据需要调整缩放比例）
            const scrollDelta = ev.deltaY * scrollSpeedFactor;
            // 使用 scrollBy 方法实现自定义滚动
            (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.scrollBy({
                top: scrollDelta,
                left: 0,
            });
            const { scrollTop } = containerRef.current;
            setTop(scrollTop);
        });
        const { clientWidth, clientHeight } = containerRef.current;
        setScrollState(Object.assign(Object.assign({}, scrollState), { viewWidth: clientWidth, viewHeight: clientHeight }));
        (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener("wheel", handleScroll, { passive: false });
        return () => {
            var _a;
            (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener("wheel", handleScroll);
        };
    }, []);
    return (jsxs("div", { ref: containerRef, style: Object.assign({ position: "relative", width: '100%', height: '100%', overflowX: 'hidden', overflowY: 'scroll' }, props.style), children: [jsx("div", { style: {
                    width: '100%',
                    height: Math.max(...columnsHeight.current)
                }, children: renderList.map((item) => (jsx("div", { className: `${props.cardClass}`, style: {
                        position: "absolute",
                        width: `${item.style.width}px`,
                        height: `${item.style.height}px`,
                        transform: `translate3d(${item.style.x}px, ${item.style.y}px, 0)`,
                    }, children: props.renderItem && props.renderItem({ item }) }, `${item.id}`))) }), props.renderLoading && jsx(props.renderLoading, {})] }));
}

export { VirtualWaterFall };
