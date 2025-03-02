import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Folder,
  Download,
  Pencil,
  RefreshCw,
  Send,
  Mic,
} from 'lucide-react';
import { ChatMessage, ChatTab, UserSettings, ChatHistory } from './types';
import ChatBubble from './components/ChatBubble';
import PDFViewer from './components/PDFViewer';
import StudentReportPDF from './components/StudentReportPDF';
import TabBar from './components/TabBar';
import ChatHistoryMenu from './components/ChatHistory';
import UserSettingsModal from './components/UserSettings';
import { pdf } from '@react-pdf/renderer';

function App() {
  // User Settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    darkMode: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Chat History
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'Generate 3 Student Reports',
      date: '11/02/2024',
      lastMessage: 'The reports have been generated successfully.',
    },
    {
      id: '2',
      title: 'Civil War Quiz',
      date: '10/02/2024',
      lastMessage: 'Quiz has been created and saved.',
    },
  ]);

  // Tabs
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: '1',
      title: 'Drafting a report for Justin',
      date: '24/06/2024',
      messages: [
        {
          id: 1,
          text: 'Hey Edion, can you generate a report for one of my students?',
          isUser: true,
        },
        {
          id: 2,
          text: 'Of course. Please provide any necessary documents, notes or work from said student.\n\nFurthermore, attach a draft or reference for how you would want the report to be structured, or select one which you have previously completed.',
          isUser: false,
        },
      ],
      activePDF: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navbarHeight = useRef<number>(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const activeTab = tabs.find((tab) => tab.id === activeTabId)!;

  // Apply dark mode class to body
  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  // Measure the navbar height after component mounts
  useEffect(() => {
    const navbar = document.querySelector('.navbar-container');
    if (navbar) {
      navbarHeight.current = navbar.getBoundingClientRect().height;
    }
  }, []);

  // Track scroll position for blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        setScrollPosition(chatContainerRef.current.scrollTop);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const generatePDF = async (tabId: string) => {
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

    const blob = await pdf(<StudentReportPDF data={sampleData} />).toBlob();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setTabs(tabs.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          messages: [...tab.messages, {
            id: tab.messages.length + 1,
            text: inputValue,
            isUser: true,
          }],
        };
      }
      return tab;
    }));

    setInputValue('');

    if (inputValue.toLowerCase().includes('generate') || inputValue.toLowerCase().includes('report')) {
      setTimeout(() => generatePDF(activeTabId), 1000);
    }
  };

  const handleNewTab = () => {
    const newTab: ChatTab = {
      id: String(Date.now()),
      title: 'New Chat',
      date: new Date().toLocaleDateString('en-GB'),
      messages: [],
      activePDF: null,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleHistoryAction = (chatId: string) => {
    if (chatId === '') {
      setShowHistory(false);
    } else {
      // Handle selecting a chat from history
      setShowHistory(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Side Menu */}
      {showHistory && <ChatHistoryMenu history={chatHistory} onSelectChat={handleHistoryAction} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800">
        {/* Top Navigation - Now with floating elements directly on the background */}
        <div className="navbar-container sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 py-3 bg-transparent">
          {/* Menu Button - Now floating directly on the background */}
          <button
            className="p-1.5 sm:p-2 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg mr-3"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
          </button>
          
          {/* Tab Bar - Now floating directly on the background */}
          <div className="flex-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-lg shadow-lg p-1.5 mx-2">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              onTabClose={handleTabClose}
              onNewTab={handleNewTab}
            />
          </div>
          
          {/* Profile Button */}
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 shadow-lg ml-3"
            onClick={() => setShowSettings(true)}
          >
            <img
              src={userSettings.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Viewer */}
          {activeTab.activePDF && (
            <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
              <PDFViewer pdfUrl={activeTab.activePDF} darkMode={userSettings.darkMode} />
            </div>
          )}

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${activeTab.activePDF ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6"
            >
              <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
                {activeTab.messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className="mb-6"
                  >
                    <ChatBubble message={message} darkMode={userSettings.darkMode} />
                    {message.pdfUrl && !message.isUser && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-2">
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Download</span>
                        </button>
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Edit</span>
                        </button>
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Regenerate report</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white/70 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md">
              <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything"
                    className="w-full px-4 py-2.5 sm:py-3 pr-24 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 shadow-sm backdrop-blur-sm"
                  />
                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                    <button
                      type="button"
                      className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                    >
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                    >
                      <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="submit"
                      className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettingsModal
          settings={userSettings}
          onClose={() => setShowSettings(false)}
          onSave={setUserSettings}
        />
      )}
    </div>
  );
}

export default App;