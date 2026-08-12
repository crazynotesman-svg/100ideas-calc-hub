/**
 * Structured-data injector.
 * Rendered as a plain <script type="application/ld+json"> so it lands in the static HTML
 * and costs zero client-side JavaScript.
 */
export function JsonLd({ id, data }: { id: string; data: object }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // JSON.stringify output is escaped for the two characters that can break out of a script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
      }}
    />
  );
}
