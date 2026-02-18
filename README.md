# React Streaming Text (RST)

A lightweight, headless React component for streaming text content progressively — word by word (or by custom chunks) — with full support for nested elements.

React Streaming Text recursively streams text inside any React tree without adding extra DOM wrappers.

## Features

- Streams text progressively
- Recursively handles nested React elements
- Optional custom render function per chunk
- Configurable streaming speed
- Fully headless (no additional wrapper elements)

## Installation

```bash
npm install react-streaming-text
```

## Basic Usage

```jsx
import RSText from "react-streaming-text";

function App() {
  return (
    <RSText>
      <p>Hello world from React Streaming Text.</p>
    </RSText>
  );
}
```

## Props

| Prop       | Type     | Description                                         |
| ---------- | -------- | --------------------------------------------------- |
| children   | `node`   | content to render                                   |
| onEnd      | `func`   | callback when streaming completes                   |
| renderer   | `func`   | apply a custom rendering function for streamed text |
| speed      | `number` | streaming speed in ms                               |
| splitRegex | `RegExp` | regex to split text for streaming using             |
