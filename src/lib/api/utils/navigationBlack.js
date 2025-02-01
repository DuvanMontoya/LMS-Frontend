import { beforeNavigate } from "$app/navigation";

export function navigateBlock(condition, message) {
  beforeNavigate(({ cancel }) => {
    if (condition()) {
      if (confirm(message)) {
        return;
      }
      cancel();
    }
  });
}
