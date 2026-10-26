// Podcast feed of the note narrations (RSS 2.0 with the iTunes tags Apple
// Podcasts and Spotify read). Built by hand, the `feed` package doesn't write
// the iTunes namespace.

export interface Episode {
  title: string;
  description: string;
  /** Path of the note, e.g. `/notes/where-the-map-ends` */
  url: string;
  /** Path of the MP3, e.g. `/audio/where-the-map-ends.mp3` */
  audio: string;
  /** Size of the MP3 in bytes */
  bytes: number;
  date: Date;
}

export interface Show {
  title: string;
  description: string;
  author: string;
  email: string;
  /** Path of the cover art, square, 1400 to 3000px */
  image: string;
}

// `pnpm narrate` encodes at a constant 96 kbit/s, so the size gives the length
const BITRATE = 96_000;

/** Length of a narration in whole seconds, from its size */
export const duration = (bytes: number) => Math.round((bytes * 8) / BITRATE);

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const item = (episode: Episode, base: string) => {
  const link = `${base}${episode.url}`;
  return `
    <item>
      <title>${escape(episode.title)}</title>
      <description>${escape(`${episode.description}\n\nRead the note: ${link}`)}</description>
      <link>${escape(link)}</link>
      <guid isPermaLink="false">${escape(link)}</guid>
      <pubDate>${episode.date.toUTCString()}</pubDate>
      <enclosure url="${escape(`${base}${episode.audio}`)}" length="${episode.bytes}" type="audio/mpeg"/>
      <itunes:duration>${duration(episode.bytes)}</itunes:duration>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
};

/** Episodes are listed in the order given, newest first by convention */
export const podcastFeed = (show: Show, episodes: Episode[], base: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(show.title)}</title>
    <description>${escape(show.description)}</description>
    <link>${escape(base)}</link>
    <atom:link href="${escape(`${base}/audio.xml`)}" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <copyright>All rights reserved, ${escape(show.author)}</copyright>
    <itunes:author>${escape(show.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${escape(show.author)}</itunes:name>
      <itunes:email>${escape(show.email)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escape(`${base}${show.image}`)}"/>
    <itunes:category text="Technology"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>${episodes.map(e => item(e, base)).join('')}
  </channel>
</rss>
`;
