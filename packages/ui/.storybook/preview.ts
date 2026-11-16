import type { Preview } from "@storybook/react-vite";

import "../src/reset.css";
import "../src/tokens.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        white: { name: "白", value: "#fff" },
        background: { name: "全体背景", value: "#e0f2f5" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "white" },
  },
};

export default preview;
