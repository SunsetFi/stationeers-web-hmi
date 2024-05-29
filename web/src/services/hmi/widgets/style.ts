import { typedKeys } from "@/utils";
import { SxProps } from "@mui/material";

export interface CommonWidgetStyle {
  marginLeft?: number | "auto";
  marginRight?: number | "auto";
  marginTop?: number | "auto";
  marginBottom?: number | "auto";
  margin?: number | "auto";

  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  padding?: number;

  width?: number;
  height?: number;

  align?: "start" | "end" | "center" | "stretch" | "baseline";
  justifyChildren?: "start" | "end" | "center" | "stretch" | "baseline";
}

const alignSelfMap: Record<Required<CommonWidgetStyle>["align"], string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

const justifySelfMap: Record<
  Required<CommonWidgetStyle>["justifyChildren"],
  string
> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
};

export function commonWidgetStyleToSx(style: CommonWidgetStyle): SxProps {
  const {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    margin,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    padding,
    width,
    height,
    align,
    justifyChildren: justify,
  } = style;

  const sx = {
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    margin,

    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    padding,

    width,
    height,

    alignSelf: align ? alignSelfMap[align] : undefined,
    justifySelf: justify ? justifySelfMap[justify] : undefined,
  };

  // Dont forward undefined, so the widgets can supply defaults that wont get overridden.
  for (const key of typedKeys(sx)) {
    if (sx[key] === undefined) {
      delete sx[key];
    }
  }

  return sx;
}
