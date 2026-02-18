import React from "react";

export type RSTProps = {
  /** content to render */
  children?: React.ReactNode;
  /** callback when streaming completes */
  onEnd?: () => void;
  /** apply a custom rendering function for streamed text */
  renderer?: (args?: React.ReactNode) => React.ReactNode;
  /** streaming speed in ms */
  speed?: number;
  /** regex to split text for streaming using */
  splitRegex?: string | RegExp;
};

type RSTContextProps = {
  /** callback when streaming completes */
  onDidRender: () => void;
  /** path used for keys */
  path: string;
  /** rendering function */
  renderer: NonNullable<RSTProps["renderer"]>;
  /** streaming speed in ms */
  speed: NonNullable<RSTProps["speed"]>;
  /** regex to split text for streaming using */
  splitRegex?: RSTProps["splitRegex"];
};

const RSTContext = React.createContext<RSTContextProps>({
  onDidRender: () => {},
  path: "",
  renderer: (node) => node,
  speed: 40,
});

type RSTStateSetter = (node: React.ReactNode, append?: boolean) => void;

type RSTState = [React.ReactNode[], RSTStateSetter];

const useRSTState = (node: React.ReactNode): RSTState => {
  // streamed output as array
  const [output, setOutput] = React.useState<React.ReactNode[]>([]);

  const setter: RSTStateSetter = (node, append = true) => {
    if (!append) {
      setOutput(Array.isArray(node) ? node : [node]);
    } else {
      setOutput((prev) => [...prev, node]);
    }
  };

  return [output, setter];
};

const RST = ({ children, onEnd, ...other }: RSTProps): React.ReactNode => {
  // streamed output as array
  const [output, setOutput] = useRSTState([]);
  // refs for streaming timeouts
  const timeoutRefs = React.useRef<number[]>([]);

  const { path, onDidRender, renderer, speed, splitRegex } = {
    // override context values with props
    ...React.useContext(RSTContext),
    ...other,
  };

  const splitIntoChunks = (str: string) => {
    // split string using split or match function
    if (splitRegex !== undefined) {
      return str.split(splitRegex) || [str];
    }
    return str.match(/\s+|\S+\s*/g) || [str];
  };

  const stream = (node: React.ReactNode, index: number) => {
    // promise to resolve after streaming
    return new Promise<void>(async (resolve) => {
      // strings are ready to stream
      if (typeof node === "string") {
        // split string into chunks by preferred regex
        const chunks = splitIntoChunks(node);
        // resolve immediately if no chunks
        if (chunks.length === 0) {
          resolve();
          return;
        }
        // stream each chunk individually
        for (const [index, chunk] of chunks.entries()) {
          timeoutRefs.current.push(
            setTimeout(() => setOutput(renderer(chunk)), index * speed),
          );
        }
        // resolve promise on last item
        timeoutRefs.current.push(setTimeout(resolve, chunks.length * speed));
        return;
      }
      // handle child elements
      if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        // check node is NOT a void element / node
        if (!node.props.hasOwnProperty("children")) {
          setOutput(renderer(node));
          resolve();
          return;
        }
        let nodeToRender = node;
        // clone element with RST component wrapping children as required
        if (!(node.type as any).__REACT_STREAMING_TEXT_LEAF__) {
          nodeToRender = React.cloneElement(
            node,
            node.props,
            <RST>{node.props.children}</RST>,
          );
        }
        // get node key with index as fallback
        const key = nodeToRender.key ?? `.${index}`;
        // append key to previous path
        const newPath = `${path}${key}`;

        const contextValue = {
          onDidRender: resolve,
          path: newPath,
          renderer,
          speed,
          splitRegex,
        };

        setOutput(
          <RSTContext.Provider key={`${path}${key}`} value={contextValue}>
            {nodeToRender}
          </RSTContext.Provider>,
        );
        // promise will resolve once child node has resolved
        return;
      }
      resolve();
    });
  };

  React.useEffect(() => {
    async function fn() {
      // stream child nodes in order
      for (const [index, child] of React.Children.toArray(children).entries()) {
        await stream(child, index);
      }
      // calling onDidRender will resolve promise from parent RST component
      onDidRender();
      // call onEnd function if available
      if (onEnd) onEnd();
    }
    fn();
    // cleanup on unmount
    return () => {
      // reset output
      setOutput([], false);
      // clear streaming timeouts
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [children]);

  return output.reduce<React.ReactNode[]>((acc, curr) => {
    // get node previously added to result array
    const prev = acc[acc.length - 1];
    // combine adjacent strings
    if (typeof prev === "string" && typeof curr === "string") {
      return [...acc.slice(0, -1), prev + curr];
    }
    return [...acc, curr];
  }, []);
};

RST.__REACT_STREAMING_TEXT_LEAF__ = true;

export default RST;
