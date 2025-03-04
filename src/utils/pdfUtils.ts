
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import StudentReportPDF from '../components/StudentReportPDF';
import { ChatTab } from '../types';
import { Document } from '@react-pdf/renderer';

export const generateStudentReportPDF = async (tabId: string, tabs: ChatTab[], setTabs: React.Dispatch<React.SetStateAction<ChatTab[]>>) => {
  const sampleData = {
    name: 'Joost Van Der Straatweg',
    grade: '8th',
    school: 'School of Rock',
    rollNumber: '129138',
    subjects: [
      { name: 'Mathematics', grade: 'A' },
      { name: 'Science', grade: 'A' },
      { name: 'English', grade: 'A-' },
      { name: 'History', grade: 'B+' },
      { name: 'Physical Education', grade: 'A' },
      { name: 'Art', grade: 'A' },
      { name: 'Music', grade: 'A' },
      { name: 'Computer Science', grade: 'A' },
      { name: 'Geography', grade: 'B+' },
    ],
  };

  // Create PDF document as a Document component with StudentReportPDF as a child
  const blob = await pdf(
    React.createElement(Document, {}, 
      React.createElement(StudentReportPDF, { data: sampleData })
    )
  ).toBlob();
  
  const url = URL.createObjectURL(blob);
  
  setTabs(tabs.map(tab => {
    if (tab.id === tabId) {
      return {
        ...tab,
        messages: [...tab.messages, {
          id: tab.messages.length + 1,
          text: 'I have generated the report for Joost. He sounds like an excellent student!\n\nPlease indicate how you would like to proceed:',
          isUser: false,
          pdfUrl: url,
        }],
        activePDF: url,
      };
    }
    return tab;
  }));
};
