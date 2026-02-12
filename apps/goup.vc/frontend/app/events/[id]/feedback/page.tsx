import PostEventExperience from '@/components/PostEventExperience'

export default function EventFeedbackPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PostEventExperience 
        eventId={params.id} 
        eventTitle="Tax Season Prep: IRS Updates & Deductions Workshop"
      />
    </div>
  )
}