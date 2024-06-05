// TODO: This massively baloons the bundle size.  We should lazy load this.
import * as Icons from "@mui/icons-material";

// We will eventually want search functionality, which the mui docs implement very well.
// See: https://github.com/mui/material-ui-docs/blob/d13fb31f4e8bbc98da5c5d29b2d6c063f757525c/docs/data/material/components/material-icons/synonyms.js

export type IconName = keyof typeof Icons;

export { Icons };
