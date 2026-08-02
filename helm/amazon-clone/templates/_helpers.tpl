# helm/amazon-clone/templates/_helpers.tpl

{{/*
Common labels applied to all resources
*/}}
{{- define "amazon-clone.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}

{{/*
Image name builder
*/}}
{{- define "amazon-clone.image" -}}
{{ .Values.iamge.repository }}/amazon-clone-{{ .service }}:{{ .Values.iamge.tag }}
{{- end }}
