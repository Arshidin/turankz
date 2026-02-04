import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export function MembershipFAQ() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
          {t('membership.faq.title')}
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqKeys.map((key, index) => (
            <AccordionItem
              key={key}
              value={key}
              className="border-[var(--border-subtle)]"
            >
              <AccordionTrigger className="text-left text-[var(--text-primary)] hover:text-[var(--accent-primary)]">
                {t(`membership.faq.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--text-secondary)]">
                {t(`membership.faq.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
