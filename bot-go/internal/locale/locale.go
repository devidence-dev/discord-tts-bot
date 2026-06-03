package locale

import "strings"

var supported = map[string]map[string]string{
	"en": enStrings,
	"es": esStrings,
}

// Localizer resolves translation strings for a given locale.
type Localizer struct {
	locale  string
	strings map[string]string
}

// New returns a Localizer for the given locale, falling back to "en".
func New(locale string) *Localizer {
	s, ok := supported[locale]
	if !ok {
		s = supported["en"]
		locale = "en"
	}
	return &Localizer{locale: locale, strings: s}
}

// Supported returns the list of supported locale codes.
func Supported() []string {
	return []string{"en", "es"}
}

// IsSupported reports whether the locale code is valid.
func IsSupported(locale string) bool {
	_, ok := supported[locale]
	return ok
}

// T looks up a translation key and substitutes {placeholder} values from vars.
func (l *Localizer) T(key string, vars ...map[string]string) string {
	s, ok := l.strings[key]
	if !ok {
		return key
	}
	if len(vars) > 0 {
		for k, v := range vars[0] {
			s = strings.ReplaceAll(s, "{"+k+"}", v)
		}
	}
	return s
}
