import { redirect } from 'next/navigation';

export default function RSUPage() {
  redirect('/plan?tab=rsu');
}
