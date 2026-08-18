"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { revealVariants, staggerVariants, viewport } from "@/lib/motion";

/**
 * Aparición al entrar en viewport.
 *
 * Los componentes animados se declaran UNA vez, fuera del render. Construirlos
 * dentro con `motion.create(tag)` devolvería un componente nuevo en cada
 * pasada, y React lo trataría como otro elemento distinto: estado y animación
 * se reiniciarían en cada re-render.
 *
 * `prefers-reduced-motion` se respeta desde la regla global de `globals.css`,
 * que anula la duración de cualquier animación (§31, §39).
 */

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as const;

export type RevealTag = keyof typeof TAGS;

type RevealProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: RevealTag;
  readonly delay?: number;
};

export function Reveal({ children, className, as = "div", delay = 0 }: RevealProps) {
  const Tag = TAGS[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={revealVariants}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

/** Contenedor que escalona la aparición de sus hijos `RevealItem`. */
export function RevealGroup({
  children,
  className,
  as = "div",
  stagger = 0.06,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: RevealTag;
  readonly stagger?: number;
}) {
  const Tag = TAGS[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerVariants(stagger)}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: RevealTag;
}) {
  const Tag = TAGS[as];

  return (
    <Tag className={className} variants={revealVariants}>
      {children}
    </Tag>
  );
}
