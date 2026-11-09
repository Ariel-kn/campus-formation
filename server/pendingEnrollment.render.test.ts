import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PendingEnrollmentPanel } from "../client/src/pages/Home";

describe("zone d’autorisation prioritaire", () => {
  it("affiche clairement les nouveaux inscrits avec une sélection de filière et une action d’autorisation", () => {
    const markup = renderToStaticMarkup(createElement(PendingEnrollmentPanel, {
      rows: [{ student: { id: 3000001, name: "Moufidath Bankole", email: "moufidathbankole@gmail.com" }, enrollment: undefined }],
      onEnrollment: () => undefined,
    }));
    expect(markup).toContain("Action requise");
    expect(markup).toContain("Moufidath Bankole");
    expect(markup).toContain("Choisir la filière…");
    expect(markup).toContain("Autoriser");
  });
});
