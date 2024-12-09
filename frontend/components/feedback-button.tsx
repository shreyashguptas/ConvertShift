'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import emailjs from '@emailjs/browser'

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const sendFeedback = async () => {
    if (!feedback.trim()) return

    setIsSending(true)
    try {
      // Send the main feedback email
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_FEEDBACK_TEMPLATE_ID!,
        {
          message: feedback,
          timestamp: new Date().toISOString(),
          url: window.location.href
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )

      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback.",
      })
      setFeedback('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to send feedback:', error)
      
      // Send failure notification email
      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_ERROR_TEMPLATE_ID!,
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            url: window.location.href
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        )
      } catch (backupError) {
        console.error('Failed to send error notification:', backupError)
      }

      toast({
        title: "Failed to send feedback",
        description: "Please try again later or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-20 z-50 shadow-lg bg-white text-gray-800 hover:bg-gray-100"
        size="sm"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Feedback
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 mr-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Send Feedback</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              placeholder="Share your feedback on file conversion features or report any issues."
              value={feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
              className="min-h-[150px] mb-4"
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={sendFeedback}
                disabled={!feedback.trim() || isSending}
              >
                {isSending ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 