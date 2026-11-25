export default {
  rules: {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    // vh はモバイルのブラウザでツールバーが引っ込んだときの高さになる。dvh・svh・lvh を使い分ける
    "unit-disallowed-list": ["vh"],
  },
  extends: ["stylelint-config-standard"],
};
