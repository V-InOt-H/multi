import VideoProcessor from "../shared/VideoProcessor";

export default function StudentVideo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900">Video Link Processor</h1>
        <p className="text-slate-500 text-sm">Process a YouTube link to get a transcript and translated dubbing.</p>
      </div>
      <VideoProcessor role="student" />
    </div>
  );
}
