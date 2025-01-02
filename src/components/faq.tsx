import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@burn/components/ui/accordion"
import { HelpCircle } from "lucide-react";

export type FAQItem = {
    question: string;
    answer: string;
};

export function FAQ({ faqList: faqList, className }: { faqList: FAQItem[], className?: string }) {
    return (
        <Accordion type="single" collapsible className={className}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">FAQ:</h4>
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
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