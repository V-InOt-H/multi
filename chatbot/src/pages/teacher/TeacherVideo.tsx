import VideoProcessor from "../shared/VideoProcessor";

export default function TeacherVideo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900">Lecture Video Upload</h1>
        <p className="text-slate-500 text-sm">Upload a video link to transcribe and dub for your students.</p>
      </div>
      <VideoProcessor role="teacher" />
    </div>
  );
}
