import React from 'react';

interface AgreementModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({ type, onClose }) => {
  const isTerms = type === 'terms';
  const title = isTerms ? '心域用户协议' : '隐私政策';
  
  const termsContent = (
    <div className="space-y-6">
      <div>
        <p className="text-slate-400 text-sm mb-4">最后更新日期：2025年1月</p>
        <p className="text-slate-300 mb-4">
          欢迎使用"心域"（HeartSphere）服务。在使用我们的服务之前，请您仔细阅读本服务条款。当您注册、登录、使用（以下统称"使用"）"心域"服务时，即表示您已阅读、理解并同意接受本服务条款的全部内容。如果您不同意本服务条款的任何内容，或者无法准确理解相关条款的含义，请不要使用我们的服务。
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">一、服务说明</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">1.1 服务内容</h3>
        <p className="text-slate-300 mb-2">"心域"是一个提供心灵探索、情感记录、虚拟角色交互等服务的平台。我们为您提供以下服务：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>个人日记和笔记记录功能；</li>
          <li>虚拟角色对话和交互功能；</li>
          <li>场景和剧本创建功能；</li>
          <li>数据同步和存储服务；</li>
          <li>其他相关功能和服务。</li>
        </ul>
        <h3 className="text-lg font-medium text-indigo-300 mb-2 mt-4">1.2 服务变更</h3>
        <p className="text-slate-300">我们保留随时修改或中断服务而不需知照用户的权利。我们行使修改或中断服务的权利，不需对用户或第三方负责。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">二、账户注册与使用</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">2.1 账户注册</h3>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>您需要注册账户才能使用部分服务功能；</li>
          <li>您应当使用真实、准确、完整的信息进行注册；</li>
          <li>您有责任维护账户信息的安全性和准确性；</li>
          <li>您不得将账户转让、出售或以其他方式提供给第三方使用。</li>
        </ul>
        <h3 className="text-lg font-medium text-indigo-300 mb-2 mt-4">2.2 账户安全</h3>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>您有责任维护账户密码的机密性；</li>
          <li>您应对使用您的账户进行的所有活动负责；</li>
          <li>如发现账户被盗用或存在安全风险，请立即通知我们。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">三、用户行为规范</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">3.1 禁止行为</h3>
        <p className="text-slate-300 mb-2">在使用服务时，您不得：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>发布、传播违反法律法规、社会公德的内容；</li>
          <li>发布、传播侵犯他人知识产权、隐私权等合法权益的内容；</li>
          <li>发布、传播含有色情、暴力、赌博、恐怖主义等不良信息的内容；</li>
          <li>发布、传播虚假、误导性信息；</li>
          <li>进行任何可能干扰、破坏服务正常运行的行为；</li>
          <li>使用自动化工具或脚本批量操作；</li>
          <li>尝试未经授权访问系统、数据或其他用户账户；</li>
          <li>其他违反法律法规或本服务条款的行为。</li>
        </ul>
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 my-4 rounded">
          <p className="text-red-300 font-semibold">重要提示：违反本条款可能导致您的账户被暂停或终止，我们保留追究法律责任的权利。</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">四、知识产权</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">4.1 我们的知识产权</h3>
        <p className="text-slate-300 mb-4">"心域"服务中包含的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，均受知识产权法律法规的保护，归我们或相关权利人所有。</p>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">4.2 您的知识产权</h3>
        <p className="text-slate-300">您在使用服务时创建、上传或发布的内容，其知识产权归您所有。但您授予我们使用、存储、展示、分发这些内容的非独占性、全球性、免费许可，以便我们能够提供和改进服务。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">五、服务费用</h2>
        <p className="text-slate-300 mb-2">我们可能提供免费和付费服务。对于付费服务：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>我们将明确告知服务费用和支付方式；</li>
          <li>付费服务一旦购买，除法律法规规定外，不予退款；</li>
          <li>我们保留调整服务价格的权利，但不会影响您已购买的服务。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">六、隐私保护</h2>
        <p className="text-slate-300">我们非常重视您的隐私保护。关于我们如何收集、使用、存储和保护您的个人信息，请参阅我们的《隐私政策》。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">七、服务中断与终止</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">7.1 服务中断</h3>
        <p className="text-slate-300 mb-2">由于以下原因导致的服务中断，我们不承担责任：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>不可抗力因素（如自然灾害、战争、罢工等）；</li>
          <li>电信部门技术故障、网络故障；</li>
          <li>政府行为或法律法规变更；</li>
          <li>其他非我们所能控制的原因。</li>
        </ul>
        <h3 className="text-lg font-medium text-indigo-300 mb-2 mt-4">7.2 服务终止</h3>
        <p className="text-slate-300 mb-2">在以下情况下，我们有权终止向您提供服务：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>您违反本服务条款；</li>
          <li>您长期未使用服务；</li>
          <li>法律法规要求；</li>
          <li>其他我们认为需要终止服务的情况。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">八、免责声明</h2>
        <p className="text-slate-300 mb-2">在法律允许的范围内，我们不对以下情况承担责任：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>因不可抗力导致的服务中断或数据丢失；</li>
          <li>因您的设备、网络等原因导致的服务无法正常使用；</li>
          <li>因第三方原因（如网络服务提供商、支付服务提供商等）导致的问题；</li>
          <li>您因使用或无法使用服务而产生的任何间接、偶然、特殊或后果性损失。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">九、争议解决</h2>
        <p className="text-slate-300">因本服务条款引起的或与本服务条款有关的任何争议，双方应友好协商解决。协商不成的，任何一方均可向服务提供者所在地有管辖权的人民法院提起诉讼。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">十、其他条款</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">10.1 条款修改</h3>
        <p className="text-slate-300 mb-4">我们有权随时修改本服务条款。修改后的条款将在网站上公布。如果您继续使用服务，即视为您接受修改后的条款。</p>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">10.2 可分割性</h3>
        <p className="text-slate-300 mb-4">如果本服务条款的任何条款被认定为无效或不可执行，不影响其他条款的效力。</p>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">10.3 联系我们</h3>
        <p className="text-slate-300 mb-2">如果您对本服务条款有任何疑问，请通过以下方式联系我们：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>网站：heartsphere.cn</li>
          <li>邮箱：请通过网站内的联系方式与我们取得联系</li>
        </ul>
      </section>
    </div>
  );

  const privacyContent = (
    <div className="space-y-6">
      <div>
        <p className="text-slate-400 text-sm mb-4">最后更新日期：2025年1月</p>
        <p className="text-slate-300 mb-4">
          欢迎使用"心域"（HeartSphere）服务。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">一、我们收集的信息</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">1.1 您主动提供的信息</h3>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li><span className="text-yellow-400 font-semibold">账户信息</span>：当您注册账户时，我们会收集您的用户名、邮箱地址、昵称等信息。</li>
          <li><span className="text-yellow-400 font-semibold">内容信息</span>：您在使用服务时主动创建、上传或发布的内容，包括但不限于日记、笔记、角色对话记录、场景设置等。</li>
          <li><span className="text-yellow-400 font-semibold">个人资料</span>：您选择填写的个人资料信息，如头像、个人简介等。</li>
        </ul>
        <h3 className="text-lg font-medium text-indigo-300 mb-2 mt-4">1.2 我们自动收集的信息</h3>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li><span className="text-yellow-400 font-semibold">设备信息</span>：包括设备型号、操作系统版本、唯一设备标识符等。</li>
          <li><span className="text-yellow-400 font-semibold">日志信息</span>：当您使用我们的服务时，我们可能会自动收集某些信息并存储在服务器日志中，包括IP地址、访问时间、访问的页面等。</li>
          <li><span className="text-yellow-400 font-semibold">位置信息</span>：当您使用基于位置的服务时，我们可能会收集和处理有关您实际位置的信息。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">二、我们如何使用收集的信息</h2>
        <p className="text-slate-300 mb-2">我们基于以下目的使用收集的信息：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>提供、维护和改进我们的服务；</li>
          <li>处理您的交易并发送相关通知；</li>
          <li>发送服务更新、安全警报和支持消息；</li>
          <li>响应您的请求、问题和反馈；</li>
          <li>进行数据分析，以改进用户体验和服务质量；</li>
          <li>检测、预防和解决技术问题；</li>
          <li>遵守法律法规要求。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">三、信息共享与披露</h2>
        <p className="text-slate-300 mb-2">我们不会向第三方出售、交易或转让您的个人信息。我们仅在以下情况下共享您的信息：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>获得您的明确同意；</li>
          <li>法律法规要求或司法机关、行政机关依法要求提供；</li>
          <li>为提供服务之必要，与我们的服务提供商、业务合作伙伴共享（我们要求这些实体对您的信息保密）；</li>
          <li>在紧急情况下，为保护用户或公众的生命、财产等重大合法权益。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">四、信息存储与安全</h2>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">4.1 信息存储</h3>
        <p className="text-slate-300 mb-4">您的个人信息将存储在中华人民共和国境内。如需跨境传输，我们将严格按照法律法规要求执行。</p>
        <h3 className="text-lg font-medium text-indigo-300 mb-2">4.2 信息安全</h3>
        <p className="text-slate-300">我们采用行业标准的安全技术和程序，保护您的个人信息免受未经授权的访问、使用或披露。我们使用加密技术、访问控制、安全审计等多种安全措施来保护您的数据。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">五、您的权利</h2>
        <p className="text-slate-300 mb-2">根据相关法律法规，您对自己的个人信息享有以下权利：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li><span className="text-yellow-400 font-semibold">访问权</span>：您有权访问您的个人信息；</li>
          <li><span className="text-yellow-400 font-semibold">更正权</span>：您有权更正不准确的个人信息；</li>
          <li><span className="text-yellow-400 font-semibold">删除权</span>：您有权要求删除您的个人信息；</li>
          <li><span className="text-yellow-400 font-semibold">撤回同意权</span>：您有权撤回您此前给予我们的同意；</li>
          <li><span className="text-yellow-400 font-semibold">注销权</span>：您有权注销您的账户。</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">六、Cookie和类似技术</h2>
        <p className="text-slate-300">我们使用Cookie和类似技术来改善用户体验、分析服务使用情况。您可以通过浏览器设置管理Cookie，但请注意，禁用Cookie可能会影响某些服务的正常使用。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">七、未成年人保护</h2>
        <p className="text-slate-300">我们非常重视对未成年人个人信息的保护。如果您是18周岁以下的未成年人，建议您请您的父母或监护人仔细阅读本隐私政策，并在征得您的父母或监护人同意的前提下使用我们的服务或向我们提供信息。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">八、隐私政策的更新</h2>
        <p className="text-slate-300">我们可能会不时更新本隐私政策。我们会在本页面上发布新的隐私政策，并通过适当方式通知您。重大变更时，我们还会提供更为显著的通知。</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-3">九、联系我们</h2>
        <p className="text-slate-300 mb-2">如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式联系我们：</p>
        <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
          <li>网站：heartsphere.cn</li>
          <li>邮箱：请通过网站内的联系方式与我们取得联系</li>
        </ul>
      </section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <button
            onClick={onClose}
            className="text-white hover:text-slate-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {isTerms ? termsContent : privacyContent}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};


