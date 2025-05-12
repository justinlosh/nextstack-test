import { VersionStatus } from "@/nextstack/lib/content-types/content-version"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Edit, Archive } from "lucide-react"

interface StatusBadgeProps {
  status: VersionStatus
  scheduledAt?: string | null
  className?: string
}

export function StatusBadge({ status, scheduledAt, className }: StatusBadgeProps) {
  switch (status) {
    case VersionStatus.DRAFT:
      return (
        <Badge variant="outline" className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${className}`}>
          <Edit className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      )
    case VersionStatus.SCHEDULED:
      return (
        <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
          {scheduledAt && <span className="ml-1 text-xs">{new Date(scheduledAt).toLocaleDateString()}</span>}
        </Badge>
      )
    case VersionStatus.PUBLISHED:
      return (
        <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 ${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Published
        </Badge>
      )
    case VersionStatus.ARCHIVED:
      return (
        <Badge variant="outline" className={`bg-gray-50 text-gray-700 border-gray-200 ${className}`}>
          <Archive className="h-3 w-3 mr-1" />
          Archived
        </Badge>
      )
    default:
      return null
  }
}
