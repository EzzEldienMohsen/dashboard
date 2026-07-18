import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("renders a script tag of type application/ld+json with the serialized data", () => {
    const data = { "@context": "https://schema.org", "@type": "Organization", name: "Acme" };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.textContent ?? "")).toEqual(data);
  });

  it("serializes arrays and primitives faithfully", () => {
    const data = [1, "two", { three: 3 }];
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.textContent ?? "")).toEqual(data);
  });
});
