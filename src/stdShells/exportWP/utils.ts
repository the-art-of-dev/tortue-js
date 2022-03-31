import { Page } from "@lib/pages";
import path from "path";
import fs from "fs-extra";

export const BODY_REG_EXP = /<body[^>]*>/i;
export const END_BODY_REG_EXP = /<\/body>/i;
export const END_HEAD_REG_EXP = /<\/head>/i;
export const FOOTER_REG_EXP = /<footer[^>]*>/i;
export function extractWPHeader(html: string): string {
  const bodyMatch = html.match(BODY_REG_EXP); //todo: add body_class
  if (!bodyMatch) return "";
  const bodyTagLength = bodyMatch[0].length;

  let header = html.slice(0, bodyMatch.index + bodyTagLength);
  const endHeadMatch = header.match(END_HEAD_REG_EXP);
  if (endHeadMatch) {
    header = `${header.slice(
      0,
      endHeadMatch.index,
    )}<?php wp_head(); ?>${header.slice(endHeadMatch.index)}`;
  }
  return `${header} <?php wp_body_open(); ?>`;
}

function generateWPTemplate(name: string): string {
  const template = `
<?php
/**
 * Template Name: ${name}
 */
defined( 'ABSPATH' ) || exit;
get_header('${name}');
if ( have_posts() ) : 
    while ( have_posts() ) : the_post();
        the_content();
    endwhile;
else :
    _e( 'Sorry, no posts matched your criteria.', 'textdomain' );
endif;
get_footer('${name}');
`;

  return template;
}

function extractWPBody(html: string): string {
  const bodyMatch = html.match(BODY_REG_EXP);
  if (!bodyMatch) return "";
  const bodyTagLength = bodyMatch[0].length;

  let footerMatch = html.match(FOOTER_REG_EXP);
  if (!footerMatch) {
    footerMatch = html.match(END_BODY_REG_EXP);
  }

  const body = html.slice(bodyMatch.index + bodyTagLength, footerMatch.index);
  return body;
}

function extractWPFooter(html: string): string {
  let footerMatch = html.match(FOOTER_REG_EXP);
  if (!footerMatch) {
    footerMatch = html.match(END_BODY_REG_EXP);
  }

  let footer = html.slice(footerMatch.index);
  const endBodyMatch = footer.match(END_BODY_REG_EXP);
  if (endBodyMatch) {
    const before = footer.slice(0, endBodyMatch.index);
    const after = footer.slice(endBodyMatch.index);
    footer = `${before}<?php wp_footer(); ?>${after}`;
  }
  return footer;
}

export async function exportWPHeader(page: Page, outputDir: string) {
  const wpPageHeaderPath = path.resolve(outputDir, `header-${page.name}.php`);
  const header = extractWPHeader(page.html);
  await fs.writeFile(wpPageHeaderPath, header);
}

export async function exportWPTemplate(page: Page, outputDir: string) {
  const wpPageTemplatePath = path.resolve(outputDir, `page-${page.name}.php`);
  const template = generateWPTemplate(page.name);
  await fs.writeFile(wpPageTemplatePath, template);
}

export async function exportWPContent(page: Page, outputDir: string) {
  const wpPagePostPath = path.resolve(outputDir, `post-${page.name}.php`);
  const post = extractWPBody(page.html);
  await fs.writeFile(wpPagePostPath, post);
}

export async function exportWPFooter(page: Page, outputDir: string) {
  const wpPageFooterPath = path.resolve(outputDir, `footer-${page.name}.php`);
  const footer = extractWPFooter(page.html);
  await fs.writeFile(wpPageFooterPath, footer);
}

export async function exportWPPage(page: Page, outputDir: string) {
  const wpPage = { ...page };
  wpPage.name = wpPage.name.replace(/-/g, "_").toLowerCase();

  await exportWPHeader(wpPage, outputDir);
  await exportWPTemplate(wpPage, outputDir);
  await exportWPContent(wpPage, outputDir);
  await exportWPFooter(wpPage, outputDir);
}
