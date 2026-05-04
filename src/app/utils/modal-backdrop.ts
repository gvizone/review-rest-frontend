/** True when the user clicked the modal backdrop (not inner content). */
export function isModalBackdropClick(event: MouseEvent): boolean {
  return event.target === event.currentTarget;
}
