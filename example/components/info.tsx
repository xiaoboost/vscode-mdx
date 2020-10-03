import React from 'react';

export interface Props {
  text: string;
}

export function Info(props: Props) {
  return <div>{props.text}</div>
}
