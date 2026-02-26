'use client';

import { useEffect } from 'react';
import { Client } from '@/app/clients/page';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  useEffect(() => {
    let isFrequentCanceller = false;

    const clientName = document.getElementById('clientName') as HTMLElement;
    const headerName = document.getElementById('headerName') as HTMLElement;
    const clientPhone = document.getElementById('clientPhone') as HTMLElement;
    const callBtn = document.getElementById('callBtn') as HTMLAnchorElement;
    const clientVisits = document.getElementById('clientVisits') as HTMLElement;
    const clientAppointments = document.getElementById('clientAppointments') as HTMLElement;
    const clientService = document.getElementById('clientService') as HTMLElement;
    const discountBadge = document.getElementById('discountBadge') as HTMLElement;
    const cancelStatus = document.getElementById('cancelStatus') as HTMLElement;
    const editModal = document.getElementById('editModal') as HTMLElement;
    const editTitle = document.getElementById('editTitle') as HTMLElement;
    const editName = document.getElementById('editName') as HTMLInputElement;
    const editPhone = document.getElementById('editPhone') as HTMLInputElement;
    const editVisits = document.getElementById('editVisits') as HTMLInputElement;
    const editAppointments = document.getElementById('editAppointments') as HTMLInputElement;
    const editService = document.getElementById('editService') as HTMLInputElement;
    const lightbox = document.getElementById('lightbox') as HTMLElement;
    const lightboxImg = document.getElementById('lightboxImg') as HTMLImageElement;

    let currentIndex = 0;
    let lightboxImages: HTMLImageElement[] = [];

    function toggleCard(el: HTMLElement) {
      el.parentElement?.classList.toggle('open');
    }

    function openEditModal() {
      if (!editModal) return;
      editModal.style.display = 'flex';
      editTitle.innerText = 'Edit ' + clientName.innerText;
      editName.value = clientName.innerText;
      editPhone.value = clientPhone.innerText;
      editVisits.value = clientVisits.innerText;
      editAppointments.value = clientAppointments.innerText;
      editService.value = clientService.innerText;
      syncEditImages();
    }

    function closeEditModal() {
      if (!editModal) return;
      editModal.style.display = 'none';
    }

    function saveClient() {
      clientName.innerText = editName.value;
      headerName.innerText = editName.value;
      clientPhone.innerText = editPhone.value;
      callBtn.href = 'tel:' + editPhone.value;
      clientVisits.innerText = editVisits.value;
      clientAppointments.innerText = editAppointments.value;
      clientService.innerText = editService.value;
      syncMainImages();
      updateCancelUI();
      checkDiscount();
      closeEditModal();
      onEdit(client); // inform parent about edit
    }

    function setEditCancel(val: boolean) {
      isFrequentCanceller = val;
    }

    function updateCancelUI() {
      if (!cancelStatus) return;
      if (isFrequentCanceller) {
        cancelStatus.className = 'status-icon red';
        cancelStatus.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>';
      } else {
        cancelStatus.className = 'status-icon green';
        cancelStatus.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
      }
    }

    function checkDiscount() {
      const visits = parseInt(clientVisits.innerText);
      discountBadge.style.display = visits % 5 === 0 && visits !== 0 ? 'inline-block' : 'none';
    }

    function buildRemoveSVG() {
      const div = document.createElement('div');
      div.className = 'remove-btn';
      div.innerHTML = `
        <svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="14" fill="white"/>
          <circle cx="14" cy="14" r="12" fill="#fbb6ce" opacity="0.85"/>
          <line x1="10" y1="10" x2="18" y2="18" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="18" y1="10" x2="10" y2="18" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
        </svg>`;
      return div;
    }

    function makeEditItem(src: string) {
      const div = document.createElement('div');
      div.className = 'edit-image-item';
      const img = document.createElement('img');
      img.src = src;
      div.appendChild(img);
      const removeBtn = buildRemoveSVG();
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        div.remove();
        syncMainImages();
      };
      div.appendChild(removeBtn);
      return div;
    }

    function syncEditImages() {
      const grid = document.getElementById('editImageGrid');
      if (!grid) return;
      grid.innerHTML = '';
      document.querySelectorAll('.image-item img').forEach((img) => {
        grid.appendChild(makeEditItem((img as HTMLImageElement).src));
      });
    }

    function addEditImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.click();

  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;

    Array.from(target.files).forEach((file) => { // no need to type as File, TS infers it
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const grid = document.getElementById('editImageGrid');
        if (grid && ev.target?.result) grid.appendChild(makeEditItem(ev.target.result as string));
        syncMainImages();
      };
      reader.readAsDataURL(file);
    });
  };
}

    function syncMainImages() {
      const mainGrid = document.getElementById('imageGrid');
      if (!mainGrid) return;
      mainGrid.innerHTML = '';
      const editImages = document.querySelectorAll('#editImageGrid img');
      editImages.forEach((img: any, i) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        const clone = document.createElement('img');
        clone.src = img.src;
        clone.onclick = () => openLightbox(i);
        div.appendChild(clone);
        mainGrid.appendChild(div);
      });
      updateLightboxImages();
    }

    function updateLightboxImages() {
      lightboxImages = Array.from(document.querySelectorAll('.image-item img')) as HTMLImageElement[];
    }

    function openLightbox(i: number) {
      currentIndex = i;
      if (!lightbox || !lightboxImg) return;
      lightbox.style.display = 'flex';
      lightboxImg.src = lightboxImages[i].src;
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.style.display = 'none';
    }

    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    let startX = 0;
    lightboxImg?.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    lightboxImg?.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 40) nextLightbox();
      else if (diff < -40) prevLightbox();
    });

    function nextLightbox() {
      currentIndex = (currentIndex + 1) % lightboxImages.length;
      lightboxImg.src = lightboxImages[currentIndex].src;
    }
    function prevLightbox() {
      currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length;
      lightboxImg.src = lightboxImages[currentIndex].src;
    }

    // Init
    syncEditImages();
    syncMainImages();
    updateCancelUI();
    checkDiscount();

    // Expose functions globally so HTML onclick works
    (window as any).toggleCard = toggleCard;
    (window as any).openEditModal = openEditModal;
    (window as any).closeEditModal = closeEditModal;
    (window as any).saveClient = saveClient;
    (window as any).setEditCancel = setEditCancel;
    (window as any).addEditImage = addEditImage;
    (window as any).openLightbox = openLightbox;
    (window as any).nextLightbox = nextLightbox;
    (window as any).prevLightbox = prevLightbox;
  }, [client, onEdit]);

  return (
    <>
      {/* CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .client-card { border:1px solid #e5e7eb; border-radius:18px; background:white; overflow:hidden; font-family:system-ui; max-width:500px; }
        .client-header { padding:16px; font-weight:600; display:flex; justify-content:space-between; cursor:pointer; }
        .client-body { max-height:0; overflow:hidden; transition:.3s ease; }
        .open .client-body { max-height:2000px; }
        .image-section { padding:16px; overflow:hidden; }
        .image-grid { display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; }
        .image-item { position:relative; flex:0 0 auto; width:110px; height:110px; border-radius:16px; overflow:hidden; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,0.06); transition:transform .25s ease; }
        .image-item:hover { transform:translateY(-3px); }
        .image-item img { width:100%; height:100%; object-fit:cover; transition:transform .3s ease; }
        .image-item:hover img { transform:scale(1.08); }
        .info-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:14px; }
        .info-box { background:white; border-radius:14px; padding:14px; box-shadow:0 4px 10px rgba(0,0,0,.05); text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px; }
        .label { font-size:12px; color:#6b7280; }
        .value { font-weight:600; }
        .big-number { font-size:22px; }
        .phone-row { display:flex; gap:10px; align-items:center; justify-content:center; }
        .call-btn { background:#22c55e; border:none; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .call-btn svg { width:18px; height:18px; fill:white; }
        .discount-badge { background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:10px; font-size:11px; display:none; }
        .status-icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .status-icon svg { width:18px; height:18px; stroke:white; stroke-width:3; fill:none; }
        .green { background:#22c55e; }
        .red { background:#ef4444; }
        .action-area { padding:14px; text-align:right; }
        button { padding:8px 14px; border:none; border-radius:12px; background:#2563eb; color:white; cursor:pointer; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:none; justify-content:center; align-items:center; }
        .modal { width:90%; max-width:400px; background:white; border-radius:20px; padding:20px; }
        .lightbox { position:fixed; inset:0; background:rgba(0,0,0,.95); display:none; justify-content:center; align-items:center; touch-action: pan-y; }
        .lightbox img { max-width: 80%; max-height: 80%; border-radius: 16px; transition: transform .3s ease; }
      `}} />
      
      {/* HTML */}
      <div className="client-card">
        <div className="client-header" onClick={(e) => (window as any).toggleCard(e.currentTarget)}>
          <span id="headerName">{client.name}</span>
          <span className="chevron"></span>
        </div>
        <div className="client-body">
          <div className="image-section">
            <div className="image-grid" id="imageGrid">
              {client.images?.map((img, idx) => (
                <div className="image-item" key={idx}>
                  <img src={img} alt={`Client ${idx + 1}`} onClick={() => (window as any).openLightbox(idx)} />
                </div>
              ))}
            </div>
          </div>
          <div className="info-cards">
            <div className="info-box"><div className="label">Name</div><div className="value" id="clientName">{client.name}</div></div>
            <div className="info-box"><div className="label">Phone</div>
              <div className="value phone-row">
                <span id="clientPhone">{client.phone}</span>
                <a id="callBtn" href={`tel:${client.phone}`} className="call-btn">📞</a>
              </div>
            </div>
            <div className="info-box"><div className="label">Visits</div><div className="value big-number" id="clientVisits">{client.notes ? 1 : 0}</div></div>
            <div className="info-box"><div className="label">Appointments</div><div className="value big-number" id="clientAppointments">0</div></div>
            <div className="info-box"><div className="label">Frequent Service</div><div className="value" id="clientService">{client.service || '—'}</div></div>
            <div className="info-box"><div className="label">Cancellation Risk</div>
              <div className="status-icon green" id="cancelStatus">✔</div>
            </div>
          </div>
          <div className="action-area">
            <button onClick={() => (window as any).openEditModal()}>Edit</button>
          </div>
        </div>
      </div>

      {/* Modals and Lightbox */}
      <div className="modal-overlay" id="editModal"></div>
      <div className="lightbox" id="lightbox"><img id="lightboxImg" /></div>
    </>
  );
}