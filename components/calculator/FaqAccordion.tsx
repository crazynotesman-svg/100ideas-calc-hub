'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import type { FaqEntry } from '@/lib/seo/schema';

/**
 * The same array feeds this UI and the FAQPage JSON-LD, which guarantees that the
 * structured data always matches the visible text (a Google requirement).
 */
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
