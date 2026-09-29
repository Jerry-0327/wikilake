import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import styles from './HpcStatus.module.css';

type TimelinePoint = {
  time: string;
  timestamp: number;
  status: number;
  latency: number;
  availability: number;
};

type Monitor = {
  provider: string;
  service: string;
  channel: string;
  board: string;
  current_status: number;
  layers: {
    model: string;
    current_status: {status: number; latency: number; timestamp: number};
    timeline: TimelinePoint[];
  }[];
};

type StatusData = {
  groups: Monitor[];
};

// /api/status 的数字状态 → 展示(1=可用,2=波动,3=不可用,0=未知)
const STATUS_META: Record<number, {label: string; color: string}> = {
  1: {label: '可用', color: '#22c55e'},
  2: {label: '波动', color: '#f59e0b'},
  3: {label: '不可用', color: '#ef4444'},
  0: {label: '未知', color: 'var(--ifm-color-emphasis-600)'},
};

// 自动刷新间隔(HPC 探测每 5 分钟一次,轮询设 60 秒以及时反映)
const REFRESH_INTERVAL = 60000;

// 按小时可用率给点阵上色
function availabilityColor(av: number): string {
  if (av >= 95) return '#22c55e';
  if (av >= 80) return '#84cc16';
  if (av >= 60) return '#f59e0b';
  return '#ef4444';
}

function formatLatency(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
}

// API 端点:线上走 Netlify 的 /hpc-api/* 代理(_redirects);
// 本地开发(F5)走 preLaunchTask 自动启动的本地代理(scripts/dev-proxy.mjs)
const IS_DEV = process.env.NODE_ENV === 'development';
const API_BASE = IS_DEV ? 'http://localhost:3999/hpc-api' : '/hpc-api';

export default function HpcStatus(): ReactNode {
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRefreshing(true);
      try {
        const r = await fetch(`${API_BASE}/status`);
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as StatusData;
        if (!cancelled) {
          setMonitors(j.groups ?? []);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };
    load();
    const timer = setInterval(load, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  if (error) {
    return (
      <div className={styles.box}>
        <p className={styles.errorLine}>服务状态数据加载失败:{error}</p>
        <p className={styles.hintLine}>
          本地开发环境没有 Netlify 代理,请在线上查看,或直接访问{' '}
          <a
            href="https://hpc.westlake.edu.cn/p/westlake"
            target="_blank"
            rel="noopener noreferrer">
            hpc.westlake.edu.cn/p/westlake
          </a>
        </p>
      </div>
    );
  }

  if (!monitors) {
    return (
      <div className={styles.box}>
        <p className={styles.hintLine}>正在加载服务状态…</p>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <ul className={styles.list}>
        {monitors.map((m) => {
          const layer = m.layers[0];
          const tl = layer?.timeline ?? [];
          const meta = STATUS_META[m.current_status] ?? {
            label: String(m.current_status),
            color: 'var(--ifm-color-emphasis-600)',
          };
          const latency = layer?.current_status?.latency;
          const avg =
            tl.length > 0
              ? Math.round(tl.reduce((a, x) => a + (x.availability ?? 0), 0) / tl.length)
              : null;
          return (
            <li
              key={`${m.provider}-${m.service}-${m.channel}`}
              className={styles.row}>
              <div className={styles.info}>
                <span className={styles.name} title={m.channel}>
                  {m.channel}
                </span>
                <span className={styles.service}>
                  {m.provider} / {m.service}
                </span>
              </div>
              <span
                className={styles.badge}
                style={{borderColor: meta.color, color: meta.color}}>
                <span className={styles.dot} style={{background: meta.color}} />
                {meta.label}
              </span>
              <div
                className={styles.sparkline}
                title="24 小时可用率,每格 1 小时">
                {tl.map((p, i) => (
                  <span
                    key={i}
                    className={styles.cell}
                    style={{background: availabilityColor(p.availability ?? 0)}}
                    title={`${p.time} · 可用率 ${Math.round(p.availability ?? 0)}%`}
                  />
                ))}
              </div>
              <span className={styles.avail}>{avg !== null ? `${avg}%` : '—'}</span>
              <span className={styles.latency}>
                {latency != null ? formatLatency(latency) : '—'}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={styles.footerRow}>
        <p className={styles.asOf}>每格 = 1 小时可用率 · 数据来源:计算中心状态监测</p>
        <button
          className={styles.refreshBtn}
          onClick={refresh}
          disabled={refreshing}>
          {refreshing ? '刷新中…' : '↻ 刷新'}
        </button>
      </div>
    </div>
  );
}