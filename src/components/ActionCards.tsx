import ActionCard from './ActionCard';
import { FileText, GraduationCap, BookOpen, HelpCircle, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ActionCards = () => {
  return (
    <div className="flex flex-wrap gap-3 w-full justify-center">
      <ActionCard
        icon={<FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
        title="Generate report"
        color="purple"
        delay={0.1}
      />
      <ActionCard
        icon={<GraduationCap className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        title="Generate exercises"
        color="blue"
        delay={0.2}
      />
      <ActionCard
        icon={<BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
        title="Plan a lesson"
        color="amber"
        delay={0.3}
      />
      <ActionCard
        icon={<HelpCircle className="w-5 h-5 text-green-500 dark:text-green-400" />}
        title="Seek advice"
        color="green"
        delay={0.4}
      />
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <ActionCard
              icon={<ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
              title="More"
              color="gray"
              delay={0.5}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-48">
          <div className="flex flex-col space-y-1">
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Create quiz
            </button>
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Provide feedback
            </button>
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Simplify concept
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ActionCards;
