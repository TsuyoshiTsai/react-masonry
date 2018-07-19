import React, { Component } from "react";
import "./App.css";

import Masonry from "./Masonry";

function debounce(func, wait) {
  let timeout;

  return function() {
    const self = this;
    const later = function() {
      timeout = null;
      func.apply(self, arguments);
    };

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (!timeout) {
      func.apply(self, arguments);
    }
  };
}

const BREAK_POINT = {
  SMALL: 640,
  MEDIUM: 960,
  LARGE: 1080
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      column: 2,
      data: []
    };

    this.initUpdateColumn = this.updateColumn.bind(this);
    this.updateColumn = debounce(this.updateColumn.bind(this), 200);
  }

  componentDidMount() {
    this.fetchData();
    this.initUpdateColumn();
    window.addEventListener("resize", this.updateColumn);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateColumn);
  }

  async fetchData() {
    const data = await fetch("https://jsonplaceholder.typicode.com/posts").then(
      response => response.json()
    );

    this.setState({ data });
  }

  updateColumn() {
    let column;

    switch (true) {
      case window.innerWidth > BREAK_POINT.LARGE:
        column = 5;
        break;

      case window.innerWidth > BREAK_POINT.MEDIUM:
        column = 4;
        break;

      case window.innerWidth > BREAK_POINT.SMALL:
        column = 3;
        break;

      default:
        column = 2;
        break;
    }

    this.setState({ column });
  }

  render() {
    return (
      <Masonry column={this.state.column}>
        {this.state.data.map((data, index) => (
          <div key={index} style={{ padding: "10px" }}>
            <div style={{ background: "#eee", padding: "10px" }}>
              <h2>{data.title}</h2>
              <p>{data.body}</p>
            </div>
          </div>
        ))}
      </Masonry>
    );
  }
}

export default App;
