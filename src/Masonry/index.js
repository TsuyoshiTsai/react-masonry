import React, { Component } from "react";
import PropTypes from "prop-types";
import ResizeObserver from "resize-observer-polyfill";

// import "./style.scss";

export default class Masonry extends Component {
  static propTypes = {
    column: PropTypes.number.isRequired,
    transitionDuration: PropTypes.number.isRequired,
    transitionTimingFunction: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    column: 1,
    transitionDuration: 200,
    transitionTimingFunction: "ease-in-out"
  };

  constructor(props) {
    super(props);

    this.initialState = {
      itemStyles: [],
      tallestColumnHeight: 0
    };

    this.state = this.initialState;

    this.masonryItemRefs = {};
    this.setMasonryItemRef = this.setMasonryItemRef.bind(this);
    this.getMasonryItemRefs = this.getMasonryItemRefs.bind(this);

    this.updateItemStylesAfterIndex = this.updateItemStylesAfterIndex.bind(
      this
    );
  }

  resizeObserver = new ResizeObserver(entries => {
    const indexRequiredUpdate = Math.min(
      ...entries.map(entry => entry.target.getAttribute("index"))
    );
    this.updateItemStylesAfterIndex(indexRequiredUpdate);
  });

  componentDidMount() {
    // 監聽 masonry-item 的 resize 事件
    this.getMasonryItemRefs().forEach(masonryItemRef =>
      this.resizeObserver.observe(masonryItemRef)
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { column, children } = this.props;

    if (column !== prevProps.column) {
      this.updateItemStylesAfterIndex(0);
    }

    // 當 masonry-item 的數量不同時，重新監聽 masonry-item 的 resize 事件
    if (
      React.Children.count(children) !==
      React.Children.count(prevProps.children)
    ) {
      this.getMasonryItemRefs().forEach(masonryItemRef =>
        this.resizeObserver.observe(masonryItemRef)
      );
    }
  }

  componentWillUnmount() {
    // 解除監聽所有 masonry-item
    this.getMasonryItemRefs().forEach(masonryItemRef =>
      this.resizeObserver.unobserve(masonryItemRef)
    );
  }

  setMasonryItemRef(node, index) {
    this.masonryItemRefs[index] = node;
  }

  getMasonryItemRefs() {
    return Object.values(this.masonryItemRefs).filter(
      masonryItemRef => masonryItemRef !== null
    );
  }

  updateItemStylesAfterIndex(index = 0) {
    const { column } = this.props;
    const { itemStyles } = this.state;
    const masonryItemRefs = this.getMasonryItemRefs();

    // 每個物件的寬度: [100] 除以 [行數] (相較於容器寬度的百分比)
    const itemWidth = 100 / column;

    // 每個物件的高度列表
    const itemHeights = masonryItemRefs.map(
      childNode => childNode.clientHeight
    );

    // 行的總高度
    // 雖然定義是常數，但因為是陣列，所以只要記憶體位置不變，就能夠變更裡面的值
    // 在迭代且取得每個物件的新樣式時，每次都會更新該陣列裡的值
    const columnHeights = new Array(column).fill(0);
    // 如果是更新索引之後的物件，先更新索引之前的高度
    if (index !== 0) {
      itemHeights.slice(0, index).forEach(itemHeight => {
        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights)
        );
        columnHeights[shortestColumnIndex] =
          columnHeights[shortestColumnIndex] + itemHeight;
      });
    }

    const oldItemStyles = itemStyles.slice(0, index);
    const newItemStyles = itemHeights.slice(index).map(itemHeight => {
      // 最短的行高度
      const shortestColumnHeight = Math.min(...columnHeights);
      // 最短的行索引
      const shortestColumnIndex = columnHeights.indexOf(shortestColumnHeight);

      // X 軸位移的距離: [行高最短的索引] 乘以 [100] (自身寬度的百分比)
      const translateX = shortestColumnIndex * 100;
      // Y 軸位移的距離: [行高最短的高度]
      const translateY = shortestColumnHeight;

      // 更新行的總高度
      columnHeights[shortestColumnIndex] =
        columnHeights[shortestColumnIndex] + itemHeight;

      // 物件的樣式
      return {
        width: `${itemWidth}%`,
        transform: `translate(${translateX}%, ${translateY}px)`
      };
    });

    this.setState({
      itemStyles: [...oldItemStyles, ...newItemStyles],
      tallestColumnHeight: Math.max(...columnHeights)
    });
  }

  render() {
    const {
      column,
      transitionDuration,
      transitionTimingFunction,
      style,
      children,
      ...restProps
    } = this.props;

    const { tallestColumnHeight } = this.state;

    const MAX_ZINDEX = React.Children.count(children);

    const newStyle = {
      ...style,
      position: "relative",
      height: tallestColumnHeight
    };

    return (
      <div style={newStyle} {...restProps}>
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            index={index}
            ref={node => this.setMasonryItemRef(node, index)}
            style={{
              // 設定 index，避免比較前面的物件會蓋掉後面的物件的問題
              zIndex: MAX_ZINDEX - index,
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(0, 0)",
              transition: `all ${transitionDuration}ms ${transitionTimingFunction}`,
              ...this.state.itemStyles[index]
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }
}
