import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@burn/components/ui/accordion"

export type FAQItem = {
    question: string;
    answer: string;
};

export function FAQ({ faqList: faqList, className }: { faqList: FAQItem[], className?: string }) {
    return (
        <Accordion type="single" collapsible className={className}>
            <h4>FAQ:</h4>
            {faqList.length > 0 ? (
                faqList.map(({ question, answer }) => (
                    <AccordionItem key={question} value={question}>
                        <AccordionTrigger>{question}</AccordionTrigger>
                        <AccordionContent>
                            {answer.split('\n\n').map((paragraph, i) => (
                                <p key={i} className="mb-4 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))
            ) : (
                <p>No FAQs available at the moment.</p>
            )}
        </Accordion>
    );
}