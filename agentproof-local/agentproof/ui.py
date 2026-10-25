"""Reusable UI styling, layout components, and design system for AgentProof Local."""

import html
from typing import Any, Optional


DESIGN_SYSTEM_CSS = """
<style>
/* AgentProof Local - Technical Developer Theme */
:root {
    --bg-main: #0B0D12;
    --bg-sidebar: #10141C;
    --bg-card: #151B26;
    --bg-card-elevated: #1B2330;
    --text-primary: #F3F6FC;
    --text-secondary: #9AA7BA;
    --text-muted: #64748B;
    --border-color: #293446;
    --accent: #7C8CFF;
    --accent-hover: #98A5FF;
    --success: #35C98A;
    --success-bg: rgba(53, 201, 138, 0.12);
    --warning: #F2B84B;
    --warning-bg: rgba(242, 184, 75, 0.12);
    --error: #FF6577;
    --error-bg: rgba(255, 101, 119, 0.12);
    --info: #55B9F5;
    --info-bg: rgba(85, 185, 245, 0.12);
}

/* Global Container Styling */
.stApp {
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

[data-testid="stSidebar"] {
    background-color: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
}

/* Header & Banner */
.ap-header {
    background: linear-gradient(135deg, #151B26 0%, #1B2330 100%);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 24px;
}

.ap-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.ap-tagline {
    font-size: 14px;
    color: var(--accent);
    font-weight: 500;
    margin: 0 0 12px 0;
}

.ap-principle {
    font-size: 12.5px;
    color: var(--text-secondary);
    background-color: rgba(124, 140, 255, 0.08);
    border-left: 3px solid var(--accent);
    padding: 8px 14px;
    border-radius: 0 6px 6px 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Custom Card Container */
.ap-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 16px;
}

.ap-card-elevated {
    background-color: var(--bg-card-elevated);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 16px;
}

/* Metric Display Cards */
.ap-metric-box {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    text-align: left;
    height: 100%;
}

.ap-metric-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-secondary);
    margin-bottom: 6px;
    font-weight: 600;
}

.ap-metric-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.1;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.ap-metric-subtext {
    font-size: 11.5px;
    color: var(--text-muted);
    margin-top: 6px;
}

/* Decision & Status Badges */
.ap-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 4px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    font-family: ui-monospace, SFMono-Regular, monospace;
}

.ap-badge-allow {
    background-color: var(--success-bg);
    color: var(--success);
    border: 1px solid rgba(53, 201, 138, 0.3);
}

.ap-badge-block {
    background-color: var(--error-bg);
    color: var(--error);
    border: 1px solid rgba(255, 101, 119, 0.3);
}

.ap-badge-warn {
    background-color: var(--warning-bg);
    color: var(--warning);
    border: 1px solid rgba(242, 184, 75, 0.3);
}

.ap-badge-info {
    background-color: var(--info-bg);
    color: var(--info);
    border: 1px solid rgba(85, 185, 245, 0.3);
}

.ap-badge-neutral {
    background-color: rgba(154, 167, 186, 0.1);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

/* Verification Layer Stepper */
.ap-layer-step {
    border-left: 2px solid var(--border-color);
    padding: 0 0 16px 16px;
    position: relative;
    margin-left: 8px;
}

.ap-layer-step::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--accent);
}

.ap-layer-step.allowed::before {
    background-color: var(--success);
}

.ap-layer-step.blocked::before {
    background-color: var(--error);
}

.ap-layer-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.ap-layer-desc {
    font-size: 12px;
    color: var(--text-secondary);
}

/* Callout Notice */
.ap-callout {
    background-color: rgba(124, 140, 255, 0.06);
    border: 1px solid rgba(124, 140, 255, 0.2);
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 12.5px;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.ap-callout-warning {
    background-color: var(--warning-bg);
    border: 1px solid rgba(242, 184, 75, 0.3);
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 12.5px;
    color: var(--warning);
    margin-bottom: 16px;
}

/* Code Preview */
.ap-code {
    background-color: #0E1219;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    color: #E2E8F0;
    overflow-x: auto;
}
</style>
"""


def render_badge(text: str, variant: str = "neutral") -> str:
    """Render a styled badge HTML element."""
    safe_text = html.escape(text)
    variant_class = {
        "allow": "ap-badge-allow",
        "block": "ap-badge-block",
        "warn": "ap-badge-warn",
        "info": "ap-badge-info",
        "neutral": "ap-badge-neutral",
    }.get(variant, "ap-badge-neutral")
    return f'<span class="ap-badge {variant_class}">{safe_text}</span>'


def render_metric_card(
    label: str,
    value: str,
    subtext: str = "",
    color: Optional[str] = None,
) -> str:
    """Render a styled metric card HTML element."""
    safe_label = html.escape(label)
    safe_value = html.escape(value)
    safe_subtext = html.escape(subtext)
    style = f' style="color: {color};"' if color else ""
    sub_html = f'<div class="ap-metric-subtext">{safe_subtext}</div>' if safe_subtext else ""

    return f"""
    <div class="ap-metric-box">
        <div class="ap-metric-label">{safe_label}</div>
        <div class="ap-metric-value"{style}>{safe_value}</div>
        {sub_html}
    </div>
    """


def render_header() -> str:
    """Render the standard header banner."""
    return """
    <div class="ap-header">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
                <div class="ap-title">
                    <span style="color: #7C8CFF;">🛡️</span> AgentProof Local
                </div>
                <div class="ap-tagline">Test AI Agents. Enforce Policies. Prove the Results.</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="ap-badge ap-badge-info">Air-Gapped Simulation</span>
                <span class="ap-badge ap-badge-neutral">v1.0.0</span>
            </div>
        </div>
        <div class="ap-principle">
            Core Principle: The model proposes. The validator checks. The policy engine decides. The mock tool enforces. The evaluator measures.
        </div>
    </div>
    """
