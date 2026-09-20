"use client";

import Link, { type LinkProps } from "next/link";
import { motion } from "framer-motion";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

type SpringLinkProps = PropsWithChildren<LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>>;

export function SpringLink({ children, ...props }: SpringLinkProps) {
  return (
    <motion.div whileHover={{ y: -3, scale: 1.006 }} whileTap={{ y: 0, scale: 0.985 }} transition={spring}>
      <Link {...props}>{children}</Link>
    </motion.div>
  );
}
