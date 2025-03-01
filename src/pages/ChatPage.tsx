import React, { useState, useRef, useEffect, useCallback } from 'react'
import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'
import { useUser } from '@/lib/contexts/UserContext'
import { useChat } from '@/lib/contexts/ChatContext'
import { useMessages } from '@/lib/contexts/MessageContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { UserList } from '@/components/UserList'
import { AIAssistant } from '@/components/AIAssistant'

interface TextRange {
  start: number
  end: number
  type: 'bold' | 'italic' | 'strike' | 'link'
  url?: string
}

export function ChatPage(): JSX.Element {
  logMethodEntry('ChatPage')
  const { user, isAuthenticated, logout } = useUser()
  const { activeChannel, channels, createChannel, setActiveChannel, joinChannel } = useChat()
  const { messages, sendMessage } = useMessages()
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [formats, setFormats] = useState<TextRange[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formatBarRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(384) // 384px = 24rem = 1.5 * w-64
  const [isResizing, setIsResizing] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll when messages change or channel changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, activeChannel, scrollToBottom])

  const handleFormat = (format: 'bold' | 'italic' | 'strike' | 'link'): void => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    if (start === end) return

    // Check if selection is already formatted with this format
    const existingFormat = formats.find(f => 
      f.type === format && 
      ((start >= f.start && start <= f.end) || (end >= f.start && end <= f.end))
    )

    if (existingFormat) {
      // Remove format
      setFormats(formats.filter(f => f !== existingFormat))
    } else {
      // Add new format
      const newFormat: TextRange = {
        start,
        end,
        type: format
      }
      
      if (format === 'link') {
        const url = prompt('Enter URL:')
        if (!url) return
        newFormat.url = url
      }

      setFormats([...formats, newFormat])
    }

    // Keep selection
    textarea.focus()
    textarea.setSelectionRange(start, end)
  }

  const getFormattedText = (text: string): React.ReactNode => {
    if (!text) return ' '

    // Sort formats by start position
    const sortedFormats = [...formats].sort((a, b) => a.start - b.start)

    const segments: { text: string; formats: TextRange[] }[] = []
    let currentPos = 0

    // Split text into segments based on format ranges
    while (currentPos < text.length) {
      const activeFormats = sortedFormats.filter(f => 
        f.start <= currentPos && f.end > currentPos
      )

      const nextChange = sortedFormats
        .map(f => f.start > currentPos ? f.start : f.end)
        .filter(pos => pos > currentPos)
        .sort((a, b) => a - b)[0] || text.length

      segments.push({
        text: text.slice(currentPos, nextChange),
        formats: activeFormats
      })

      currentPos = nextChange
    }

    // Render segments with their formats
    return segments.map((segment, index) => {
      let content: React.ReactNode = segment.text

      segment.formats.forEach(format => {
        switch (format.type) {
          case 'bold':
            content = <strong key={`bold-${index}`} className="font-bold">{content}</strong>
            break
          case 'italic':
            content = <em key={`italic-${index}`} className="italic">{content}</em>
            break
          case 'strike':
            content = <del key={`strike-${index}`} className="line-through">{content}</del>
            break
          case 'link':
            content = (
              <a 
                key={`link-${index}`} 
                href={format.url} 
                className="text-blue-600 hover:underline pointer-events-auto"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {content}
              </a>
            )
            break
        }
      })

      return <span key={index}>{content}</span>
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        formatBarRef.current &&
        !formatBarRef.current.contains(event.target as Node)
      ) {
        setIsInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async (): Promise<void> => {
    logMethodEntry('ChatPage.handleLogout')
    try {
      setActiveChannel(null)
      await logout()
    } catch (error) {
      logError(error as Error, 'ChatPage.handleLogout')
    }
    logMethodExit('ChatPage.handleLogout')
  }

  const handleSubmit = async (): Promise<void> => {
    logMethodEntry('ChatPage.handleSubmit')
    if (!messageText.trim()) return

    try {
      await sendMessage(messageText)
      setMessageText('')
      setFormats([])
      logMethodExit('ChatPage.handleSubmit', { success: true })
    } catch (error) {
      logError(error as Error, 'ChatPage.handleSubmit')
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>): Promise<void> => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await handleSubmit()
    }
  }

  const renderInput = (): React.ReactNode => {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder="Message #general"
          className="w-full bg-transparent border-0 focus:ring-0 text-transparent placeholder-gray-500 resize-none min-h-[24px] p-0"
          style={{ caretColor: 'black' }}
          rows={1}
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value)
            // Adjust formats when text changes
            const newLength = e.target.value.length
            const oldLength = messageText.length
            const diff = newLength - oldLength
            
            if (diff !== 0) {
              const pos = e.target.selectionStart - (diff > 0 ? diff : 0)
              setFormats(formats.map(format => ({
                ...format,
                start: format.start >= pos ? format.start + diff : format.start,
                end: format.end >= pos ? format.end + diff : format.end
              })))
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="text-gray-900">
            {getFormattedText(messageText)}
          </div>
        </div>
      </div>
    )
  }

  // Create a default channel if none exists
  useEffect(() => {
    logMethodEntry('ChatPage.createDefaultChannelEffect')
    if (!isAuthenticated) {
      logMethodExit('ChatPage.createDefaultChannelEffect', { reason: 'not authenticated' })
      return
    }

    // Always try to join the general channel first
    void supabase
      .from('channels')
      .select('*')
      .eq('id', 'c0d46316-9e1d-4e8b-a7e7-b0a46c17c58c')
      .single()
      .then(async ({ data: generalChannel, error }) => {
        if (error) {
          logError(error, 'ChatPage.createDefaultChannelEffect')
          return
        }

        if (generalChannel) {
          try {
            await joinChannel(generalChannel.id)
            setActiveChannel(generalChannel)
          } catch (joinError) {
            logError(joinError as Error, 'ChatPage.createDefaultChannelEffect')
          }
        } else {
          // Only create a new general channel if it doesn't exist
          try {
            const channel = await createChannel('general', 'The default channel for general discussion')
            setActiveChannel(channel)
          } catch (createError) {
            logError(createError as Error, 'ChatPage.createDefaultChannelEffect')
          }
        }
      })

    logMethodExit('ChatPage.createDefaultChannelEffect')
  }, [isAuthenticated, joinChannel, createChannel, setActiveChannel])

  // Select first channel if none is active
  useEffect(() => {
    logMethodEntry('ChatPage.selectFirstChannelEffect')
    if (!activeChannel && channels.length > 0) {
      setActiveChannel(channels[0])
    }
    logMethodExit('ChatPage.selectFirstChannelEffect')
  }, [activeChannel, channels, setActiveChannel])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!isResizing) return
      
      // Prevent text selection during resize
      e.preventDefault()
      
      // Calculate width from the right edge of the window to the mouse position
      const newWidth = Math.max(150, Math.min(800, window.innerWidth - e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = (): void => {
      setIsResizing(false)
      // Re-enable text selection
      document.body.style.userSelect = 'text'
      document.body.style.cursor = 'default'
    }

    if (isResizing) {
      // Disable text selection while resizing
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return (): void => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Reset styles when unmounting
      document.body.style.userSelect = 'text'
      document.body.style.cursor = 'default'
    }
  }, [isResizing])

  const result = (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">ChatGenius</h1>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout} 
            data-cy="logout-button"
            aria-label="Logout"
          >
            <span className="sr-only">Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-2">
          <Button variant="secondary" className="w-full justify-start mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Home
          </Button>
          <Button variant="secondary" className="w-full justify-start mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m21 11-6-6c-1.2-1.2-3.1-1.2-4.2 0L3 13v8h8l8-8" /><path d="m9 17 4.8-4.8" /></svg>
            Activity
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>
            DMs
          </Button>
        </nav>

        <Separator className="my-2" />

        {/* Channels */}
        <div className="px-2 flex-1 overflow-y-auto">
          <div className="mb-4" data-cy="channel-list">
            <h2 className="px-2 mb-2 text-sm font-semibold text-gray-500">Channels</h2>
            {channels.map(channel => (
              <Button 
                key={channel.id} 
                variant="secondary" 
                className="w-full justify-between mb-1"
                data-cy="channel-item"
                onClick={() => setActiveChannel(channel)}
              >
                <span className="flex items-center">
                  <span className="text-gray-500 mr-2">#</span>
                  {channel.name}
                </span>
                {channel.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Channel Users */}
          <UserList />
        </div>

        {/* User Status */}
        <div className="p-4 bg-white border-t">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Channel Header */}
        <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">#</span>
            <h2 className="font-semibold text-gray-900">{activeChannel?.name ?? 'Select a channel'}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start mb-4">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline">
                  <span className="font-semibold mr-2 text-gray-900">{message.userName}</span>
                  <span className="text-xs text-gray-500">
                    {message.createdAt.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-2">
            {isInputFocused && (
              <div ref={formatBarRef} className="flex items-center space-x-2 mb-2 border-b border-gray-200 pb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFormat('bold')}
                >
                  <span className="font-bold">B</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFormat('italic')}
                >
                  <span className="italic">I</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFormat('strike')}
                >
                  <span className="line-through">S</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFormat('link')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                </Button>
              </div>
            )}
            {renderInput()}
          </div>
        </div>
      </div>

      {!rightSidebarOpen && (
        <button
          onClick={() => setRightSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-purple-100 hover:bg-purple-200 p-2 rounded-l-lg shadow-md transition-all duration-200 ease-in-out"
          aria-label="Open AI Assistant"
          data-cy="open-ai-assistant"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-purple-600"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}

      {/* Right Sidebar */}
      {rightSidebarOpen && (
        <div 
          className="bg-gray-50 border-l border-gray-200 relative flex flex-col"
          style={{ width: `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-purple-200 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizing(true)
            }}
            style={{ 
              backgroundColor: isResizing ? 'rgb(233 213 255)' : 'transparent',
            }}
            data-cy="sidebar-resize-handle"
          />
          
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                <button 
                  onClick={() => setRightSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close AI Assistant"
                  data-cy="close-ai-assistant"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIAssistant />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  logMethodExit('ChatPage')
  return result
} 