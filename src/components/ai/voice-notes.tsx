'use client';

import { useState, useEffect, useRef } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Save, 
  Trash2,
  Download,
  MessageSquare,
  Clock,
  Volume2,
  FileText,
  Sparkles
} from 'lucide-react';

interface VoiceNote {
  id: string;
  transcript: string;
  summary: string;
  actionItems: string[];
  timestamp: Date;
  duration: number;
  audioBlob?: Blob;
  category: 'lead-call' | 'interview' | 'follow-up' | 'research' | 'general';
  leadId?: string;
  confidence: number;
}

interface VoiceNotesProps {
  onNoteCreated?: (note: VoiceNote) => void;
  leadId?: string;
}

export default function VoiceNotes({ onNoteCreated, leadId }: VoiceNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VoiceNote['category']>('general');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useCopilotAction({
    name: "processVoiceNote",
    description: "Process voice note transcript to extract insights, action items, and summaries",
    parameters: [
      {
        name: "transcript",
        type: "string",
        description: "Voice note transcript to process",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Category of the voice note",
        required: true,
      }
    ],
    handler: async ({ transcript, category }) => {
      return await processVoiceTranscript(transcript, category);
    },
  });

  useCopilotAction({
    name: "generateFollowUpTasks",
    description: "Generate follow-up tasks from voice note content",
    parameters: [
      {
        name: "noteContent",
        type: "string",
        description: "Content of the voice note",
        required: true,
      }
    ],
    handler: async ({ noteContent }) => {
      return generateFollowUpTasks(noteContent);
    },
  });

  useCopilotAction({
    name: "categorizeNote",
    description: "Automatically categorize voice note based on content",
    parameters: [
      {
        name: "transcript",
        type: "string",
        description: "Voice note transcript",
        required: true,
      }
    ],
    handler: async ({ transcript }) => {
      return await categorizeNote(transcript);
    },
  });

  const processVoiceTranscript = async (transcript: string, category: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const processed = {
      summary: generateSummary(transcript, category),
      actionItems: extractActionItems(transcript),
      insights: generateInsights(transcript, category),
      confidence: Math.random() * 20 + 80 // 80-100%
    };
    
    setIsProcessing(false);
    return processed;
  };

  const generateSummary = (transcript: string, category: string): string => {
    if (category === 'lead-call') {
      return "Call discussion covered company background, current challenges, and potential fit for automotive roles.";
    } else if (category === 'interview') {
      return "Interview notes covering technical competencies, cultural fit, and next steps in the process.";
    } else if (category === 'follow-up') {
      return "Follow-up planning session with timing, messaging, and approach strategies.";
    }
    return "General notes and observations from voice recording session.";
  };

  const extractActionItems = (transcript: string): string[] => {
    const items = [];
    
    if (transcript.toLowerCase().includes('follow up') || transcript.toLowerCase().includes('call back')) {
      items.push('Schedule follow-up contact');
    }
    if (transcript.toLowerCase().includes('send') && transcript.toLowerCase().includes('email')) {
      items.push('Send follow-up email');
    }
    if (transcript.toLowerCase().includes('research')) {
      items.push('Research additional company information');
    }
    if (transcript.toLowerCase().includes('update') && transcript.toLowerCase().includes('resume')) {
      items.push('Update resume/portfolio');
    }
    
    return items.length > 0 ? items : ['Review and organize notes'];
  };

  const generateInsights = (transcript: string, category: string): string[] => {
    const insights = [];
    
    if (category === 'lead-call') {
      insights.push('Strong interest in digital transformation initiatives');
      insights.push('Current team gaps in technical expertise');
    } else if (category === 'interview') {
      insights.push('Positive reception of automotive experience');
      insights.push('Company culture emphasizes team collaboration');
    }
    
    return insights;
  };

  const generateFollowUpTasks = async (noteContent: string) => {
    return {
      immediate: ['Update CRM with call notes', 'Schedule follow-up email'],
      thisWeek: ['Research additional contacts at company', 'Prepare customized portfolio'],
      longTerm: ['Monitor company news and updates', 'Network with industry connections']
    };
  };

  const categorizeNote = async (transcript: string) => {
    const keywords = {
      'lead-call': ['dealership', 'manager', 'hiring', 'opportunity', 'position'],
      'interview': ['interview', 'questions', 'skills', 'experience', 'culture'],
      'follow-up': ['follow up', 'next step', 'timeline', 'response'],
      'research': ['research', 'company', 'background', 'investigation']
    };
    
    let bestMatch: VoiceNote['category'] = 'general';
    let maxMatches = 0;
    
    Object.entries(keywords).forEach(([category, words]) => {
      const matches = words.filter(word => 
        transcript.toLowerCase().includes(word)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category as VoiceNote['category'];
      }
    });
    
    return { category: bestMatch, confidence: (maxMatches / 5) * 100 };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup MediaRecorder for audio
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // Setup Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          setCurrentTranscript(prev => prev + finalTranscript);
        };
        
        recognitionRef.current.start();
      }
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    // Process the recording
    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const processed = await processVoiceTranscript(currentTranscript, selectedCategory);
      
      const voiceNote: VoiceNote = {
        id: Date.now().toString(),
        transcript: currentTranscript,
        summary: processed.summary,
        actionItems: processed.actionItems,
        timestamp: new Date(),
        duration: recordingDuration,
        audioBlob,
        category: selectedCategory,
        leadId,
        confidence: processed.confidence
      };
      
      setVoiceNotes(prev => [voiceNote, ...prev]);
      onNoteCreated?.(voiceNote);
      setCurrentTranscript('');
      setRecordingDuration(0);
    }, 500);
  };

  const togglePause = () => {
    if (isPaused) {
      recognitionRef.current?.start();
      mediaRecorderRef.current?.resume();
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.pause();
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const exportNote = (note: VoiceNote) => {
    const content = `
Voice Note - ${note.timestamp.toLocaleString()}
Category: ${note.category}
Duration: ${formatDuration(note.duration)}

TRANSCRIPT:
${note.transcript}

SUMMARY:
${note.summary}

ACTION ITEMS:
${note.actionItems.map(item => `• ${item}`).join('\n')}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-note-${note.timestamp.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  const categoryOptions = [
    { value: 'lead-call', label: 'Lead Call', icon: '📞' },
    { value: 'interview', label: 'Interview', icon: '💼' },
    { value: 'follow-up', label: 'Follow-up', icon: '📧' },
    { value: 'research', label: 'Research', icon: '🔍' },
    { value: 'general', label: 'General', icon: '📝' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-500" />
            AI Voice Notes
          </CardTitle>
          <CardDescription>
            Record, transcribe, and get AI insights from your voice notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Note Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedCategory === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(option.value as VoiceNote['category'])}
                  className="flex items-center gap-2"
                >
                  <span>{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            {isRecording && (
              <div className="mb-4">
                <div className="text-2xl font-mono font-bold text-red-600">
                  {formatDuration(recordingDuration)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm text-gray-600">
                    {isPaused ? 'Paused' : 'Recording...'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-3">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop & Process
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Real-time Transcript */}
          {currentTranscript && (
            <Card className="bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Live Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{currentTranscript}</p>
              </CardContent>
            </Card>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <Card className="bg-yellow-50">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-yellow-600 animate-spin" />
                <p className="text-sm text-yellow-800">AI is processing your voice note...</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Voice Notes List */}
      {voiceNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Voice Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {voiceNotes.map((note) => (
                <Card key={note.id} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {categoryOptions.find(c => c.value === note.category)?.icon} {note.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDuration(note.duration)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {note.confidence.toFixed(0)}% confident
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {note.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-gray-700 mb-1">Summary:</p>
                      <p className="text-sm text-gray-600">{note.summary}</p>
                    </div>
                    
                    {note.actionItems.length > 0 && (
                      <div>
                        <p className="font-medium text-sm text-gray-700 mb-1">Action Items:</p>
                        <ul className="text-sm text-gray-600 list-disc pl-4">
                          {note.actionItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <details>
                      <summary className="font-medium text-sm text-gray-700 cursor-pointer">
                        Full Transcript
                      </summary>
                      <p className="text-sm text-gray-600 mt-2 pl-2 border-l-2 border-gray-200">
                        {note.transcript}
                      </p>
                    </details>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportNote(note)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNote(note.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}