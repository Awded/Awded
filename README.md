# Awded

Visual overlay for deaf and hard of hearing players to visualize direction of audio during gameplay, for increased situational awareness.

### Options & CSS Variables:

| Option Name     | Variable               | Description                                                                                  |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| N/A             | ---value               | "Loudness" of this frequency band.                                                           |
| N/A             | ---average-value       | Running average "loudness" of the frequency band, samples default to 5. Editable in options. |
| N/A             | ---peak-value          | Largest recent value, decay is set by options.                                               |
| N/A             | ---other-value         | Value of same frequency on opposite channel.                                                 |
| N/A             | ---other-average-value | Average value of same frequency on opposite channel.                                         |
| N/A             | ---other-peak-value    | Peak value of same frequency on opposite channel.                                            |
|                 |                        |                                                                                              |
| FFT Size        | ---fftSize             | FFT Size, identical to how many bars each channel will have times 2.                         |
| Theme           | ---theme               | String of currently loaded theme.                                                            |
| Update FPS      | ---update-fps          | FPS the visualizer is updating at.                                                           |
| Primary Color   | ---primary-color       | Color selected in options.                                                                   |
| Secondary Color | ---secondary-color     | Color selected in options.                                                                   |
| Tertiary Color  | ---tertiary-color      | Color selected in options.                                                                   |
| Bar Rotatoin    | ---bar-rotation        | Rotation of bars, in degrees.                                                                |
| Bar Width       | ---bar-width           | Multiplier for bar width.                                                                    |
| Bar Height      | ---bar-height          | Multiplier for bar height.                                                                   |
| Average Length  | ---average-length      | Running average length for calculating --average-value.                                      |
| Bar Y Spread    | ---bar-y-spread        | Vertical space between each frequency band.                                                  |
| Bar X Spread    | ---bar-x-spread        | Horizontal space between channels.                                                           |
| Bar Offset X    | ---bar-offset-x        | Left/right offset of visualization.                                                          |
| Bar Offset Y    | ---bar-offset-y        | Up/down offset of visualization.                                                             |
| Bar Inverse     | ---bar-inverse         | Determines if low frequencys are on top or bottom.                                           |
