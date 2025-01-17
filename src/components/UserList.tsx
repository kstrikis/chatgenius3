import React from 'react'
import { logMethodEntry, logMethodExit } from '@/lib/logger'
import { useChannelUsers } from '@/lib/contexts/ChannelUsersContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function UserList(): React.ReactElement {
  logMethodEntry('UserList')
  const { users, isLoading, error } = useChannelUsers()

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  const getStatusColor = (status: 'online' | 'away' | 'offline'): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  let result: React.ReactElement
  if (isLoading) {
    result = <div className="p-4">Loading users...</div>
  } else if (error) {
    result = <div className="p-4 text-red-500">{error}</div>
  } else {
    result = (
      <div className="p-4" data-cy="user-list">
        <h2 className="mb-4 text-lg font-semibold">Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center space-x-3"
              data-cy="user-item"
            >
              <div className="relative">
                <Avatar>
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div
                  data-cy="user-status"
                  className={cn(
                    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                    getStatusColor(user.status)
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  logMethodExit('UserList')
  return result
} 