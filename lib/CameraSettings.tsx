import React from 'react';
import {
  MediaDeviceMenu,
  TrackReference,
  TrackToggle,
  useLocalParticipant,
  VideoTrack,
} from '@livekit/components-react';
import { BackgroundBlur, VirtualBackground } from '@livekit/track-processors';
import { isLocalTrack, LocalTrackPublication, Track } from 'livekit-client';

const BACKGROUND_IMAGES = [
  {
    name: 'Desk',
    path: '/background-images/samantha-gades-BlIhVfXbi9s-unsplash.jpg',
  },
  {
    name: 'Nature',
    path: '/background-images/ali-kazal-tbw_KQE3Cbg-unsplash.jpg',
  },
];

type BackgroundType = 'none' | 'blur' | 'image';

export function CameraSettings() {
  const { cameraTrack, localParticipant } = useLocalParticipant();

  const [backgroundType, setBackgroundType] =
    React.useState<BackgroundType>('none');

  const [virtualBackgroundImagePath, setVirtualBackgroundImagePath] =
    React.useState<string | null>(null);

  const camTrackRef: TrackReference | undefined =
    React.useMemo(() => {
      return cameraTrack
        ? {
            participant: localParticipant,
            publication: cameraTrack,
            source: Track.Source.Camera,
          }
        : undefined;
    }, [localParticipant, cameraTrack]);

  const selectBackground = (
    type: BackgroundType,
    imagePath?: string
  ) => {
    setBackgroundType(type);

    if (type === 'image' && imagePath) {
      setVirtualBackgroundImagePath(imagePath);
    } else {
      setVirtualBackgroundImagePath(null);
    }
  };

  React.useEffect(() => {
    if (!isLocalTrack(cameraTrack?.track)) return;

    if (backgroundType === 'blur') {
      cameraTrack.track?.setProcessor(
        BackgroundBlur()
      );
    } else if (
      backgroundType === 'image' &&
      virtualBackgroundImagePath
    ) {
      cameraTrack.track?.setProcessor(
        VirtualBackground(
          virtualBackgroundImagePath
        )
      );
    } else {
      cameraTrack.track?.stopProcessor();
    }
  }, [
    cameraTrack,
    backgroundType,
    virtualBackgroundImagePath,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {camTrackRef && (
        <VideoTrack
          trackRef={camTrackRef}
          style={{
            maxHeight: '280px',
            objectFit: 'contain',
            transform: 'scaleX(-1)',
          }}
        />
      )}

      <section className="lk-button-group">
        <TrackToggle source={Track.Source.Camera}>
          Camera
        </TrackToggle>

        <div className="lk-button-group-menu">
          <MediaDeviceMenu kind="videoinput" />
        </div>
      </section>

      <div>
        <div
          style={{
            marginBottom: '10px',
          }}
        >
          Background Effects
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="lk-button"
            onClick={() =>
              selectBackground('none')
            }
          >
            None
          </button>

          <button
            className="lk-button"
            onClick={() =>
              selectBackground('blur')
            }
          >
            Blur
          </button>

          {BACKGROUND_IMAGES.map(
            (image) => (
              <button
                key={image.path}
                className="lk-button"
                onClick={() =>
                  selectBackground(
                    'image',
                    image.path
                  )
                }
                style={{
                  backgroundImage: `url(${image.path})`,
                  backgroundSize: 'cover',
                  backgroundPosition:
                    'center',
                  width: '80px',
                  height: '60px',
                }}
              >
                <span
                  style={{
                    background:
                      'rgba(0,0,0,.6)',
                    padding:
                      '2px 5px',
                    borderRadius:
                      '4px',
                  }}
                >
                  {image.name}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
