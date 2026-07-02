import { useEffect, useRef, useState } from 'react'
import { MapPin, Mail, Phone, Building2, ChevronRight, Star } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import styles from './ContactDetail.module.scss'

// ── Trụ sở chính ─────────────────────────────────────────────
const HEADQUARTER = {
  id: 'hq',
  name: '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng ',
  address: '58 Phước Lý 9 – Phường Hòa Khánh – TP. Đà Nẵng',
  email: 'facebook.com/gomsuviethuong',
  phone: '0905.386.888',
  lat: 16.0707,
  lng: 108.1526,
  image_url: 'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
}

// ── Văn phòng đại diện ────────────────────────────────────────
const BRANCHES = [
  {
    id: 'dn1',
    name: 'Văn Phòng Đà Nẵng 1',
    address: '133 Trung Lương 14, Phường Hòa Xuân, TP. Đà Nẵng',
    email: 'facebook.com/gomsuviethuong',
    phone: '0905.386.888',
    lat: 15.9897,
    lng: 108.2465,
    image_url: 'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
  },
  {
    id: 'dn2',
    name: 'Văn Phòng Đà Nẵng 2',
    address: 'Đường Đ1, Thôn Đồng Yên, Xã Duy Xuyên, TP. Đà Nẵng',
    email: 'facebook.com/gomsuviethuong',
    phone: '0905.386.888',
    lat: 15.8237,
    lng: 108.2457,
    image_url: 'https://res.cloudinary.com/dq8cmcln9/image/upload/v1775449642/danang_zprcls.webp',
  },
  {
    id: 'hcm',
    name: 'Chi Nhánh Hồ Chí Minh',
    address: '246 Nguyễn Duy Trinh, P. Bình Trưng, TP. Hồ Chí Minh',
    email: 'facebook.com/gomsuviethuong',
    phone: '0905.386.888',
    lat: 10.7877,
    lng: 106.7583,
    image_url: 'https://viethuongceramics.com/wp-content/smush-webp/2026/01/LQM01215-scaled-1.jpg.webp',
  },
  {
    id: 'hp',
    name: 'Chi Nhánh Hải Phòng',
    address: '298 Phạm Văn Đồng, Phường Hưng Đạo, TP. Hải Phòng',
    email: 'facebook.com/gomsuviethuong',
    phone: '0905.386.888',
    lat: 20.7963,
    lng: 106.7118,
    image_url: 'https://viethuongceramics.com/wp-content/uploads/2026/01/SHOWROOM-3D.jpg.webp',
  },
]

// Tất cả locations để đặt markers (HQ + branches)
const ALL_LOCATIONS = [HEADQUARTER, ...BRANCHES]

const VN_GEOJSON_URL =
  'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/VNM/ADM0/geoBoundaries-VNM-ADM0.geojson'

export default function ContactDetail() {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])
  const heroRef = useRef(null)
  const [active, setActive] = useState('hq')

  // ── Parallax hero ─────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      if (!heroRef.current) return
      const bg = heroRef.current.querySelector(`.${styles.heroBg}`)
      if (bg) bg.style.transform = `translateY(${window.scrollY * 0.35}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Leaflet map ───────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    function initMap() {
      if (!mapRef.current || leafletMap.current) return

      const map = window.L.map(mapRef.current, {
        center: [16.0707, 108.1526],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      })

      window.L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }
      ).addTo(map)

      // GeoJSON Việt Nam border
      fetch(VN_GEOJSON_URL)
        .then(r => r.json())
        .then(data => {
          const outerRing = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]
          const innerRings = []
          data.features.forEach(f => {
            const geo = f.geometry
            if (geo.type === 'Polygon') innerRings.push(geo.coordinates[0])
            else if (geo.type === 'MultiPolygon')
              geo.coordinates.forEach(poly => innerRings.push(poly[0]))
          })
          window.L.geoJSON(
            { type: 'Feature', geometry: { type: 'Polygon', coordinates: [outerRing, ...innerRings] } },
            { style: { fillColor: '#0d0d1a', fillOpacity: 0.72, stroke: false }, interactive: false }
          ).addTo(map)
          window.L.geoJSON(data, {
            style: { fill: false, color: '#C0392B', weight: 2, opacity: 0.85 },
            interactive: false,
          }).addTo(map)
        })
        .catch(() => {})

      // Markers — tất cả locations
      ALL_LOCATIONS.forEach((loc, i) => {
        const isHQ = loc.id === 'hq'
        const icon = window.L.divIcon({
          className: '',
          html: `<div class="cd-marker ${isHQ ? 'cd-marker--hq' : ''}">
            <div class="cd-marker__dot"></div>
            <div class="cd-marker__pulse"></div>
            ${isHQ ? '<div class="cd-marker__star">★</div>' : ''}
          </div>`,
          iconSize: isHQ ? [40, 40] : [32, 32],
          iconAnchor: isHQ ? [20, 20] : [16, 16],
          popupAnchor: [0, -20],
        })

        const marker = window.L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div class="cd-popup">
              ${isHQ ? '<span class="cd-popup__badge">TRỤ SỞ CHÍNH</span>' : ''}
              <strong>${loc.name}</strong>
              <span>${loc.address}</span>
            </div>`,
            { closeButton: false, offset: [0, -8] }
          )

        marker.on('click', () => setActive(loc.id))
        markersRef.current[i] = marker
      })

      setTimeout(() => {
        markersRef.current[0]?.openPopup()
      }, 600)

      leafletMap.current = map
    }

    if (window.L) initMap()
    else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    return () => {
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null }
    }
  }, [])

  function handleLocationClick(loc, index) {
    setActive(loc.id)
    if (leafletMap.current) {
      leafletMap.current.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 })
      markersRef.current[index]?.openPopup()
    }
  }

  return (
    <>
      <Helmet>
        <title>Liên Hệ - Chi Nhánh Việt Hương Logistics</title>
        <meta name="description" content="Liên hệ Vận Tải Việt Hương. Chi nhánh tại Đà Nẵng, Hải Phòng, TP. HCM. Hotline: 0905.386.888." />
      </Helmet>

      <div className={styles.page}>

      <div className={styles.hero} ref={heroRef}>
  <div className={styles.heroInner}>
    <p className={styles.heroEyebrow}>Công ty Vận Tải Việt Hương</p>
    <h1 className={styles.heroTitle}>
      <em>Tìm</em> Chi nhánh<br /><em>Gần</em> Bạn Nhất
    </h1>
    <p className={styles.heroSub}>
      Hệ thống văn phòng vận tải tại các thành phố lớn trên khắp Việt Nam
    </p>
  </div>
<div className={styles.heroWave}>
  <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
    <path d="M0,0 C360,60 1080,0 1440,0 L1440,70 L0,70 Z" fill="#f7f4f2" />
  </svg>
</div>
</div>

        {/* ── BODY ── */}
        <div className={styles.body}>

          {/* ── SIDEBAR ── */}
          <div className={styles.sidebar}>

            {/* ── TRỤ SỞ CHÍNH ── */}
            <div className={styles.sectionLabel}>
              <Building2 size={14} />
              Trụ Sở Chính
            </div>
            <div
              className={`${styles.cardHq} ${active === HEADQUARTER.id ? styles.cardHqActive : ''}`}
              onClick={() => handleLocationClick(HEADQUARTER, 0)}
            >
              <div className={styles.cardHqThumb}>
                <img src={HEADQUARTER.image_url} alt={HEADQUARTER.name} />
                <div className={styles.cardHqThumbOverlay} />
                <span className={styles.hqBadge}>TRỤ SỞ CHÍNH</span>
              </div>
              <div className={styles.cardHqContent}>
                <h3 className={styles.cardHqName}>{HEADQUARTER.name}</h3>
                <div className={styles.cardRow}>
                  <MapPin size={13} className={styles.cardIcon} />
                  <span>{HEADQUARTER.address}</span>
                </div>
                <div className={styles.cardRow}>
                  <Mail size={13} className={styles.cardIcon} />
                  <span>{HEADQUARTER.email}</span>
                </div>
                <div className={styles.cardRow}>
                  <Phone size={13} className={styles.cardIcon} />
                  <span>{HEADQUARTER.phone}</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCta}>
                    Xem trên bản đồ <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* ── VĂN PHÒNG ĐẠI DIỆN ── */}
            <div className={styles.sectionLabel}>
              <MapPin size={14} />
              Văn Phòng Đại Diện
            </div>
            <div className={styles.cards}>
              {BRANCHES.map((branch, i) => (
                <div
                  key={branch.id}
                  className={`${styles.card} ${active === branch.id ? styles.cardActive : ''}`}
                  onClick={() => handleLocationClick(branch, i + 1)}
                >
                  <div className={styles.cardThumb}>
                    <img src={branch.image_url} alt={branch.name} />
                    <div className={styles.cardThumbOverlay} />
                    <span className={styles.cardThumbIndex}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardName}>{branch.name}</h3>
                    <div className={styles.cardRow}>
                      <MapPin size={13} className={styles.cardIcon} />
                      <span>{branch.address}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <Mail size={13} className={styles.cardIcon} />
                      <span>{branch.email}</span>
                    </div>
                    <div className={styles.cardRow}>
                      <Phone size={13} className={styles.cardIcon} />
                      <span>{branch.phone}</span>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.cardCta}>
                        Xem trên bản đồ <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.moreBadge}>
              <span className={styles.moreBadgeValue}>
                Thêm nhiều chi nhánh khác trên khắp cả nước++
              </span>
            </div>
          </div>

          {/* ── MAP ── */}
          <div className={styles.mapWrap}>
            <div ref={mapRef} className={styles.map} />
          </div>
        </div>
      </div>
    </>
  )
}