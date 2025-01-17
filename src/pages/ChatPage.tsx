import React, { useState, useRef, useEffect } from 'react'
import { logMethodEntry, logMethodExit, logError } from '@/lib/logger'
import { useUser } from '@/lib/contexts/UserContext'
import { useChat } from '@/lib/contexts/ChatContext'
import { useMessages } from '@/lib/contexts/MessageContext'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface DirectMessage {
  id: string
  name: string
  status: 'online' | 'away' | 'offline'
  unread: number
}

interface TextRange {
  start: number
  end: number
  type: 'bold' | 'italic' | 'strike' | 'link'
  url?: string
}

export function ChatPage(): React.ReactElement {
  logMethodEntry('ChatPage')
  const { user, isAuthenticated, logout } = useUser()
  const { activeChannel, channels, createChannel, setActiveChannel } = useChat()
  const { messages, sendMessage } = useMessages()
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [formats, setFormats] = useState<TextRange[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formatBarRef = useRef<HTMLDivElement>(null)

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

  // Mock data - will be replaced with real data
  const directMessages: DirectMessage[] = [
    { id: '1', name: 'User One', status: 'online', unread: 0 },
    { id: '2', name: 'User Two', status: 'away', unread: 1 },
    { id: '3', name: 'User Three', status: 'offline', unread: 0 }
  ]

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    logMethodExit('ChatPage', { redirecting: true })
    return <Navigate to="/" replace />
  }

  const handleLogout = async (): Promise<void> => {
    logMethodEntry('ChatPage.handleLogout')
    await logout()
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
    if (isAuthenticated && channels.length === 0) {
      void createChannel('general', 'The default channel for general discussion')
        .then(channel => {
          setActiveChannel(channel)
        })
        .catch(error => {
          logError(error as Error, 'ChatPage.createDefaultChannelEffect')
        })
    }
    logMethodExit('ChatPage.createDefaultChannelEffect')
  }, [isAuthenticated, channels.length, createChannel, setActiveChannel])

  // Select first channel if none is active
  useEffect(() => {
    logMethodEntry('ChatPage.selectFirstChannelEffect')
    if (!activeChannel && channels.length > 0) {
      setActiveChannel(channels[0])
    }
    logMethodExit('ChatPage.selectFirstChannelEffect')
  }, [activeChannel, channels, setActiveChannel])

  const result = (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Workspace Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">ChatGenius</h1>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
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
          <div className="mb-4">
            <h2 className="px-2 mb-2 text-sm font-semibold text-gray-500">Channels</h2>
            {channels.map(channel => (
              <Button key={channel.id} variant="secondary" className="w-full justify-between mb-1">
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

          {/* Direct Messages */}
          <div>
            <h2 className="px-2 mb-2 text-sm font-semibold text-gray-500">Direct Messages</h2>
            {directMessages.map(dm => (
              <Button key={dm.id} variant="secondary" className="w-full justify-between mb-1">
                <span className="flex items-center">
                  <span className="relative mr-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{dm.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                      dm.status === 'online' ? 'bg-green-500' :
                      dm.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </span>
                  {dm.name}
                </span>
                {dm.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 rounded-full">
                    {dm.unread}
                  </span>
                )}
              </Button>
            ))}
          </div>
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

      {/* Right Sidebar */}
      {rightSidebarOpen && (
        <div className="w-64 bg-gray-50 border-l border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Thread</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setRightSidebarOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
            </div>
            <p className="text-gray-500 text-sm">No thread selected</p>
          </div>
        </div>
      )}
    </div>
  )

  logMethodExit('ChatPage')
  return result
} 