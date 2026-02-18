import { act, render, screen, waitFor } from "@testing-library/react";
import RSText from "../";

const renderAndRun = (component) => {
  render(component);
  // run timer to render output
  act(() => {
    jest.runAllTimers();
  });
};

describe("React Streaming Text", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Renders plain text", () => {
    renderAndRun(<RSText>Hello World</RSText>);
    expect(screen.getByText("Hello World"));
  });

  test("Renders HTML passed as children", () => {
    renderAndRun(
      <RSText>
        <b>Hello World</b>
      </RSText>,
    );
    expect(screen.getByText("Hello World"));
  });

  test("Renders void HTML elements passed as children", () => {
    renderAndRun(
      <RSText>
        <input type="text" />
      </RSText>,
    );
    expect(screen.getByRole("textbox"));
  });

  test("Renders nested RSText components", () => {
    renderAndRun(
      <RSText>
        <RSText>Hello World</RSText>
      </RSText>,
    );
    expect(screen.getByText("Hello World"));
  });

  test("Calls custom renderer function for each word", () => {
    const renderer = jest.fn();
    renderAndRun(<RSText renderer={renderer}>Hello World</RSText>);
    expect(renderer).toHaveBeenCalledTimes(2);
  });

  test("Calls custom renderer function for each character", () => {
    const renderer = jest.fn();

    renderAndRun(
      <RSText renderer={renderer} splitRegex={""}>
        Hello World
      </RSText>,
    );
    expect(renderer).toHaveBeenCalledTimes(11);
  });

  test("Calls onEnd function when streaming is complete", async () => {
    const onEnd = jest.fn();
    renderAndRun(<RSText onEnd={onEnd}>Hello World</RSText>);
    expect(screen.getByText("Hello World"));

    waitFor(() => {
      expect(onEnd).toHaveBeenCalledTimes(1);
    });
  });
});
