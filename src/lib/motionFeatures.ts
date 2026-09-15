import { domMax } from "motion/react";

// domMax (pas domAnimation) : la grille du Portfolio (Phase 4) a besoin des
// animations de layout (`layout`, `AnimatePresence mode="popLayout"`) pour le
// réordonnancement au filtrage, que domAnimation ne supporte pas.
export default domMax;
