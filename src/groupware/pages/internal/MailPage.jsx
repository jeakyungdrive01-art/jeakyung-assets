import PageScaffold from '../../components/PageScaffold.jsx';
import { PAGE_MODULES, toSections } from '../../config/pageModules.js';

export default function MailPage() {
  return <PageScaffold eyebrow="TERRA MAIL" title="이메일" description="IWINV Terra Mail과 안전하게 연결할 사내 메일 영역입니다." notice="현재는 실제 메일 계정, iframe, API, IMAP과 SMTP를 연결하지 않았습니다." sections={toSections(PAGE_MODULES.mail)} />;
}
