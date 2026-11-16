import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CheckButton } from "./check-button";

const render = (props: Record<string, unknown>, label = "Teks") => renderToStaticMarkup(createElement(CheckButton, props as never, label));

describe("CheckButton", () => {
  it("keeps a real hidden checkbox with the form name and value", () => {
    const html = render({ name: "planId", value: 7, defaultChecked: true });
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('name="planId"');
    expect(html).toContain('value="7"');
    expect(html).toContain("checked");
    expect(html).toContain("peer sr-only");
    expect(html).toContain("has-checked:bg-primary");
  });

  it("shows a check mark only when checked unless an icon is given", () => {
    expect(render({ name: "a" })).toContain("peer-checked:block");
    const withIcon = render({ name: "a", icon: createElement("i", { "data-icon": "x" }) });
    expect(withIcon).toContain('data-icon="x"');
    expect(withIcon).not.toContain("peer-checked:block");
  });

  it("swaps to checkedIcon while checked", () => {
    const html = render({ name: "a", icon: createElement("i", { "data-icon": "off" }), checkedIcon: createElement("i", { "data-icon": "on" }) });
    expect(html).toContain("peer-checked:hidden");
    expect(html).toContain("peer-checked:inline-flex");
  });

  it("passes disabled to the input and styles the label", () => {
    const html = render({ name: "a", disabled: true });
    expect(html).toContain('disabled=""');
    expect(html).toContain("has-disabled:opacity-50");
  });
});
