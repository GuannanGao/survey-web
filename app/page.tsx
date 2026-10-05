"use client";

import { useState } from "react";

/* ----------------------------- 选项与题目常量 ----------------------------- */

const GENDER = ["男", "女", "其他"];
const EDUCATION = ["高中及以下", "大专", "本科", "研究生及以上"];
const UNEMP_DUR = ["<6个月", "6-12个月", ">1年"];
const JOB_CHANNEL = [
  "线上招聘平台",
  "线下招聘会",
  "亲友推荐",
  "政府就业指导中心",
  "其他",
];
const MARITAL = ["未婚", "已婚"];
const RESIGN_REASON = ["公司裁员", "个人辞职", "合同到期", "其他"];
const REEMP_TIME = ["<3个月", "3-6个月", ">6个月", "不确定"];

// GSES / HADS 量表选项（值, 文案）
const GSES_OPTS: [string, string][] = [
  ["1", "完全不正确"],
  ["2", "不太正确"],
  ["3", "比较正确"],
  ["4", "完全正确"],
];
const HADS_OPTS: [string, string][] = [
  ["0", "没有"],
  ["1", "有时"],
  ["2", "经常"],
  ["3", "总是"],
];

const GSES_Q = [
  "如果别人反对我的观点，我相信我有能力说服他们",
  "遇到复杂问题时，我通常能找到解决办法",
  "即使事情进展不顺，我通常仍能坚持下去",
  "我能像其他人一样解决问题",
  "我通常能克服障碍，达到目标",
  "即使遭遇挫折，我也能迅速恢复",
  "我对自己的能力有信心",
  "我能有效管理压力情境",
  "当面临不确定性时，我能做出决策",
  "我有能力应对新的挑战",
];

const HADS_Q = [
  "我感到紧张不安",
  "我感到坐立不安",
  "我感到害怕",
  "我感到无法放松",
  "我感到心神不宁",
  "我担心即将发生的坏事",
  "我感到非常紧张",
];

/* ------------------------------- 表单状态 ------------------------------- */

const initialForm = {
  c1: false,
  c2: false,
  c3: false,
  c4: false,
  c5: false,
  participantSignature: "",
  participantDate: "",
  researcherSignature: "Guan-nan Gao",
  researcherDate: "",
  gender: "",
  age: "",
  ethnicity: "",
  education: "",
  householdRegistration: "",
  monthlyIncome: "",
  unemploymentDuration: "",
  jobSearchChannel: "",
  expectedSalary: "",
  maritalStatus: "",
  previousJobType: "",
  industryCategory: "",
  resignationReason: "",
  weeklyJobSearch: "",
  expectedReemploymentTime: "",
  gses: Array(10).fill(""),
  hads: Array(7).fill(""),
};

type FormState = typeof initialForm;

/* ------------------------------- 组件 ------------------------------- */

export default function SurveyPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setGses = (i: number, v: string) =>
    setForm((f) => {
      const g = [...f.gses];
      g[i] = v;
      return { ...f, gses: g };
    });
  const setHads = (i: number, v: string) =>
    setForm((f) => {
      const h = [...f.hads];
      h[i] = v;
      return { ...f, hads: h };
    });

  function validate(): string[] {
    const e: string[] = [];
    if (![form.c1, form.c2, form.c3, form.c4, form.c5].every(Boolean))
      e.push("请勾选全部知情同意项");
    if (!form.participantSignature.trim()) e.push("请填写参与者签名");
    if (!form.participantDate) e.push("请填写参与者日期");

    if (!form.gender) e.push("请选择性别");
    if (form.age === "") e.push("请填写年龄");
    else if (Number(form.age) <= 0 || Number(form.age) > 120)
      e.push("年龄数值不合法");
    if (!form.education) e.push("请选择文化程度");
    if (!form.unemploymentDuration) e.push("请选择失业时长");
    if (!form.jobSearchChannel) e.push("请选择当前主要求职渠道");
    if (!form.maritalStatus) e.push("请选择婚姻状况");
    if (form.monthlyIncome === "") e.push("请填写家庭人均月收入");
    else if (Number(form.monthlyIncome) < 0) e.push("家庭人均月收入不能为负");
    if (form.expectedSalary === "") e.push("请填写求职期望薪资");
    else if (Number(form.expectedSalary) < 0) e.push("期望薪资不能为负");

    if (!form.previousJobType.trim()) e.push("请填写失业前工作岗位类型");
    if (!form.industryCategory.trim()) e.push("请填写行业类别");
    if (!form.resignationReason) e.push("请选择离职原因");
    if (form.weeklyJobSearch === "") e.push("请填写目前每周求职次数");
    else if (Number(form.weeklyJobSearch) < 0) e.push("每周求职次数不能为负");
    if (!form.expectedReemploymentTime) e.push("请选择期望再就业时间");

    form.gses.forEach((v, i) => {
      if (!v) e.push(`请完成自我效能量表（GSES）第 ${i + 1} 题`);
    });
    form.hads.forEach((v, i) => {
      if (v === "") e.push(`请完成焦虑量表（HADS-A）第 ${i + 1} 题`);
    });

    return e;
  }

  async function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (e.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = {
      consent_understand_purpose: form.c1 ? 1 : 0,
      consent_voluntary: form.c2 ? 1 : 0,
      consent_confidential: form.c3 ? 1 : 0,
      consent_academic: form.c4 ? 1 : 0,
      consent_agree: form.c5 ? 1 : 0,
      participant_signature: form.participantSignature,
      participant_date: form.participantDate,
      researcher_signature: form.researcherSignature,
      researcher_date: form.researcherDate,
      gender: form.gender,
      age: Number(form.age),
      ethnicity: form.ethnicity,
      education: form.education,
      household_registration: form.householdRegistration,
      monthly_income: Number(form.monthlyIncome),
      unemployment_duration: form.unemploymentDuration,
      job_search_channel: form.jobSearchChannel,
      expected_salary: Number(form.expectedSalary),
      marital_status: form.maritalStatus,
      previous_job_type: form.previousJobType,
      industry_category: form.industryCategory,
      resignation_reason: form.resignationReason,
      weekly_job_search: Number(form.weeklyJobSearch),
      expected_reemployment_time: form.expectedReemploymentTime,
      ...form.gses.reduce(
        (o, v, i) => ((o[`gses_${i + 1}`] = Number(v)), o),
        {} as Record<string, number>
      ),
      ...form.hads.reduce(
        (o, v, i) => ((o[`hads_${i + 1}`] = Number(v)), o),
        {} as Record<string, number>
      ),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([data.message || "提交失败，请重试"]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setErrors(["网络错误，提交失败，请重试"]);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setErrors([]);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <main className="container">
        <div className="card">
          <div className="success-box">
            <h2 style={{ border: "none" }}>✅ 提交成功</h2>
            <p>感谢您的参与，您的问卷数据已成功记录。</p>
            <div className="form-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={handleReset}>
                再填写一份
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        {errors.length > 0 && (
          <div className="error-box">
            <strong>请修正以下问题后重新提交：</strong>
            <ul>
              {errors.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ===================== Annexure 1 研究信息告知单 ===================== */}
        <h1>研究信息告知单</h1>
        <p style={{ color: "var(--muted)" }}>（Annexure 1 · 研究说明，以下内容请仔细阅读）</p>
        <div className="readonly-block">
          <p>
            <strong>研究题目：</strong>中国失业青年职业焦虑与自我效能的关系研究
          </p>
          <p>
            <strong>研究目的：</strong>
            本研究旨在了解当前中国失业青年的职业焦虑水平及其与一般自我效能感之间的关系，为相关部门制定就业帮扶与心理健康干预政策提供实证依据。
          </p>
          <p>
            <strong>参与要求：</strong>
            年满 18 周岁、目前处于失业状态（无稳定全职工作）的中国青年（建议年龄 18–35 岁）可自愿参与。
          </p>
          <p>
            <strong>研究流程：</strong>
            您将首先阅读本研究的信息告知单与知情同意书，在充分理解并签署同意后，填写一份包含人口学特征、工作状态、一般自我效能量表（GSES）与医院焦虑抑郁量表（HADS-A）的匿名问卷，预计耗时 10–15 分钟。
          </p>
          <p>
            <strong>风险与不适：</strong>
            问卷涉及个人就业与情绪状态，可能引起轻微的不适或情绪波动；如感到不适，您可随时停止。本研究为匿名调查，不会对身体造成伤害。
          </p>
          <p>
            <strong>参与权益：</strong>
            您的参与完全自愿，可随时无条件退出，且不会影响您接受任何就业服务或福利。
          </p>
          <p>
            <strong>数据保密：</strong>
            收集的数据仅以匿名编码形式存储，研究报告中不会出现任何可识别个人身份的信息；数据保存于受访问控制的本地服务器，仅供研究团队成员使用。
          </p>
          <p>
            <strong>补偿：</strong>
            本研究为学术无偿调查，不提供经济报酬；您的贡献将直接支持就业与心理健康领域的科学研究。
          </p>
          <p>
            <strong>联系方式：</strong>
            如对本研究有疑问或希望行使数据权利，请联系研究者：［研究者姓名］ / 邮箱：［邮箱］ / 电话：［电话］。伦理审批编号：［编号］。
          </p>
          <p>
            <strong>声明：</strong>
            签署本告知单不代表您已同意参与；是否参与以您签署下方知情同意书为准。
          </p>
        </div>

        {/* ===================== Annexure 2 知情同意书 ===================== */}
        <h2>知情同意书（Annexure 2）</h2>
        <p>
          我已经阅读并理解上述研究信息告知单的内容。请勾选以下各项以表示您同意参与本研究：
        </p>

        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={form.c1}
            onChange={(e) => set("c1", e.target.checked)}
          />
          <span>我已了解研究目的、流程和潜在风险</span>
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={form.c2}
            onChange={(e) => set("c2", e.target.checked)}
          />
          <span>我理解参与是完全自愿的，可随时退出</span>
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={form.c3}
            onChange={(e) => set("c3", e.target.checked)}
          />
          <span>我理解我的个人信息将被保密处理</span>
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={form.c4}
            onChange={(e) => set("c4", e.target.checked)}
          />
          <span>我理解我的数据仅用于学术研究目的</span>
        </label>
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={form.c5}
            onChange={(e) => set("c5", e.target.checked)}
          />
          <span>我同意参加本项研究并签署此文件</span>
        </label>

        <div className="sign-row">
          <div className="field">
            <label className="q">参与者签名 *</label>
            <input
              type="text"
              value={form.participantSignature}
              onChange={(e) => set("participantSignature", e.target.value)}
              placeholder="请输入您的签名"
            />
          </div>
          <div className="field">
            <label className="q">日期 *</label>
            <input
              type="date"
              value={form.participantDate}
              onChange={(e) => set("participantDate", e.target.value)}
            />
          </div>
        </div>
        <div className="sign-row">
          <div className="field">
            <label className="q">研究者签名</label>
            <input
              type="text"
              value={form.researcherSignature}
              onChange={(e) => set("researcherSignature", e.target.value)}
              placeholder="研究者签名（可选）"
            />
          </div>
          <div className="field">
            <label className="q">日期</label>
            <input
              type="date"
              value={form.researcherDate}
              onChange={(e) => set("researcherDate", e.target.value)}
            />
          </div>
        </div>

        <div className="section-divider" />

        {/* ===================== Annexure 3 调查问卷 ===================== */}
        <h2>调查问卷（Annexure 3）</h2>

        <h3>第一部分 人口学特征</h3>

        <div className="field">
          <label className="q">1. 性别</label>
          <div className="radio-group">
            {GENDER.map((o) => (
              <RadioItem
                key={o}
                name="gender"
                value={o}
                checked={form.gender === o}
                onPick={(v) => set("gender", v)}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="q">2. 年龄（岁）</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            placeholder="请输入数字"
          />
        </div>

        <div className="field">
          <label className="q">3. 民族</label>
          <input
            type="text"
            value={form.ethnicity}
            onChange={(e) => set("ethnicity", e.target.value)}
            placeholder="如：汉族"
          />
        </div>

        <div className="field">
          <label className="q">4. 文化程度</label>
          <div className="radio-group">
            {EDUCATION.map((o) => (
              <RadioItem
                key={o}
                name="education"
                value={o}
                checked={form.education === o}
                onPick={(v) => set("education", v)}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="q">5. 户籍所在地</label>
          <input
            type="text"
            value={form.householdRegistration}
            onChange={(e) => set("householdRegistration", e.target.value)}
            placeholder="如：浙江省杭州市"
          />
        </div>

        <div className="field">
          <label className="q">6. 家庭人均月收入（元）</label>
          <input
            type="number"
            value={form.monthlyIncome}
            onChange={(e) => set("monthlyIncome", e.target.value)}
            placeholder="请输入数字"
          />
        </div>

        <div className="field">
          <label className="q">7. 失业时长</label>
          <div className="radio-group">
            {UNEMP_DUR.map((o) => (
              <RadioItem
                key={o}
                name="unemploymentDuration"
                value={o}
                checked={form.unemploymentDuration === o}
                onPick={(v) => set("unemploymentDuration", v)}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="q">8. 当前主要求职渠道</label>
          <div className="radio-group">
            {JOB_CHANNEL.map((o) => (
              <RadioItem
                key={o}
                name="jobSearchChannel"
                value={o}
                checked={form.jobSearchChannel === o}
                onPick={(v) => set("jobSearchChannel", v)}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="q">9. 求职期望薪资（元/月）</label>
          <input
            type="number"
            value={form.expectedSalary}
            onChange={(e) => set("expectedSalary", e.target.value)}
            placeholder="请输入数字"
          />
        </div>

        <div className="field">
          <label className="q">10. 婚姻状况</label>
          <div className="radio-group">
            {MARITAL.map((o) => (
              <RadioItem
                key={o}
                name="maritalStatus"
                value={o}
                checked={form.maritalStatus === o}
                onPick={(v) => set("maritalStatus", v)}
              />
            ))}
          </div>
        </div>

        <h3>第二部分 工作状态与经历</h3>

        <div className="field">
          <label className="q">1. 失业前工作岗位类型</label>
          <input
            type="text"
            value={form.previousJobType}
            onChange={(e) => set("previousJobType", e.target.value)}
            placeholder="如：软件开发工程师"
          />
        </div>

        <div className="field">
          <label className="q">2. 行业类别</label>
          <input
            type="text"
            value={form.industryCategory}
            onChange={(e) => set("industryCategory", e.target.value)}
            placeholder="如：互联网 / 制造业"
          />
        </div>

        <div className="field">
          <label className="q">3. 离职原因</label>
          <div className="radio-group">
            {RESIGN_REASON.map((o) => (
              <RadioItem
                key={o}
                name="resignationReason"
                value={o}
                checked={form.resignationReason === o}
                onPick={(v) => set("resignationReason", v)}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="q">4. 目前每周求职次数（次）</label>
          <input
            type="number"
            value={form.weeklyJobSearch}
            onChange={(e) => set("weeklyJobSearch", e.target.value)}
            placeholder="请输入数字"
          />
        </div>

        <div className="field">
          <label className="q">5. 期望再就业时间</label>
          <div className="radio-group">
            {REEMP_TIME.map((o) => (
              <RadioItem
                key={o}
                name="expectedReemploymentTime"
                value={o}
                checked={form.expectedReemploymentTime === o}
                onPick={(v) => set("expectedReemploymentTime", v)}
              />
            ))}
          </div>
        </div>

        <h3>第三部分 一般自我效能量表（GSES）</h3>
        <p style={{ color: "var(--muted)" }}>
          请选择最符合您实际情况的选项：1=完全不正确，2=不太正确，3=比较正确，4=完全正确。
        </p>
        {GSES_Q.map((q, i) => (
          <div className="field" key={i}>
            <label className="q">
              {i + 1}. {q}
            </label>
            <div className="radio-group scale">
              {GSES_OPTS.map(([val, label]) => (
                <RadioItem
                  key={val}
                  name={`gses_${i}`}
                  value={val}
                  label={`${val} ${label}`}
                  checked={form.gses[i] === val}
                  onPick={(v) => setGses(i, v)}
                />
              ))}
            </div>
          </div>
        ))}

        <h3>第四部分 医院焦虑抑郁量表（HADS-A）焦虑子量表</h3>
        <p style={{ color: "var(--muted)" }}>
          请选择最近一周内您的情况：0=没有，1=有时，2=经常，3=总是。
        </p>
        {HADS_Q.map((q, i) => (
          <div className="field" key={i}>
            <label className="q">
              {i + 1}. {q}
            </label>
            <div className="radio-group scale">
              {HADS_OPTS.map(([val, label]) => (
                <RadioItem
                  key={val}
                  name={`hads_${i}`}
                  value={val}
                  label={`${val} ${label}`}
                  checked={form.hads[i] === val}
                  onPick={(v) => setHads(i, v)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "提交中…" : "提交"}
          </button>
          <button className="btn" onClick={handleReset} disabled={submitting}>
            重置
          </button>
        </div>
      </div>
    </main>
  );
}

/* ------------------------- 复用：单选按钮项 ------------------------- */

function RadioItem({
  name,
  value,
  checked,
  onPick,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onPick: (v: string) => void;
  label?: string;
}) {
  return (
    <label className="radio-item">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onPick(value)}
      />
      <span>{label ?? value}</span>
    </label>
  );
}
