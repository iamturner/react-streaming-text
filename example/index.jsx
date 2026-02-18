import React from "react";
import ReactDOM from "react-dom/client";
import RSText from "../src/index";

const SampleText = (
  <p>
    Lorem ipsum dolor sit amet, <b>consectetur adipiscing elit</b> sed do
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, <u>uis nostrud exercitation ullamco</u> laboris nisi ut aliquip ex
    ea commodo consequat.
  </p>
);

const Example = (props) => {
  const [visible, setVisible] = React.useState(false);

  return visible ? (
    <RSText {...props}>{SampleText}</RSText>
  ) : (
    <button onClick={() => setVisible(true)} type="button">
      Run code
    </button>
  );
};

const Demo = () => (
  <div className="wrapper">
    <RSText splitRegex={/(?=.)/}>
      <h1>React Streaming Text</h1>
    </RSText>

    <p>
      A lightweight, headless React component for streaming text content
      progressively — word by word (or by custom chunks) — with full support for
      nested elements.
    </p>

    <h2>Default Example</h2>

    <p>
      By default, React Streaming Text streams text word-by-word at a speed of
      40ms per word.
    </p>

    <pre>
      <code>
        {`<RSText>
  <p>Lorem ipsum dolor sit amet, <b>consectetur...</p>
</RSText>`}
      </code>
    </pre>

    <Example />

    <h2>Custom Split Regex</h2>
    <p>
      Passing a custom regex to stream text on every character rather than every
      word. The regex is passed to javascript's <code>.split()</code> method.
    </p>

    <pre>
      <code>
        {`<RSText splitRegex={/(?=.)/}>
  <p>Lorem ipsum dolor sit amet, <b>consectetur...</p>
</RSText>`}
      </code>
    </pre>

    <Example splitRegex={/(?=.)/} />

    <h2>Custom Renderer</h2>
    <p>
      Pass a custom renderer function to handle each streamed chunk. In this
      example, each chunk is wrapped in a span. This can be useful for applying
      animations or transitions with CSS.
    </p>

    <pre>
      <code>
        {`<RSText renderer={node => <span>{node}</span>}>
  <p>Lorem ipsum dolor sit amet, <b>consectetur...</p>
</RSText>`}
      </code>
    </pre>

    <Example renderer={(node) => <span>{node}</span>} />
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
